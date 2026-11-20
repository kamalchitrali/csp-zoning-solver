from collections.abc import Iterator
from dataclasses import dataclass
from typing import Protocol

from ..models import SolveRequest, SolveResponse, Step

Domains = dict[str, tuple[str, ...]]


@dataclass
class CSP:
    variables: tuple[str, ...]
    domains: Domains
    neighbors: dict[str, tuple[str, ...]]

    @classmethod
    def from_request(cls, request: SolveRequest) -> "CSP":
        variables = tuple(request.variable_order)
        positions = {variable: index for index, variable in enumerate(variables)}
        adjacent: dict[str, set[str]] = {variable: set() for variable in variables}
        for left, right in request.edges:
            adjacent[left].add(right)
            adjacent[right].add(left)
        values = tuple(request.value_order)
        return cls(
            variables,
            dict.fromkeys(variables, values),
            {
                variable: tuple(sorted(neighbors, key=positions.__getitem__))
                for variable, neighbors in adjacent.items()
            },
        )


class Propagator(Protocol):
    def __call__(
        self, neighbors: tuple[str, ...], value: str, assignment: dict[str, str], domains: Domains
    ) -> tuple[Domains, list[str]]: ...


@dataclass
class SearchFrame:
    domains: Domains
    candidates: Iterator[str]


def search(csp: CSP, propagate: Propagator | None = None) -> SolveResponse:
    assignment: dict[str, str] = {}
    steps: list[Step] = []
    backtracks = 0

    def undo(variable: str) -> None:
        nonlocal backtracks
        steps.append(Step(assign=variable, value=assignment.pop(variable), action="backtrack"))
        backtracks += 1

    # Each frame keeps the domains visible before its variable was assigned.
    # Returning to that frame restores its domains and resumes its value iterator.
    first = csp.variables[0]
    stack = [SearchFrame(csp.domains, iter(csp.domains[first]))]
    while stack:
        depth = len(stack) - 1
        variable = csp.variables[depth]
        frame = stack[-1]
        value = next(frame.candidates, None)
        if value is None:
            stack.pop()
            if stack:
                undo(csp.variables[depth - 1])
            continue

        neighbors = csp.neighbors[variable]
        conflicts = [
            neighbor for neighbor in neighbors
            if neighbor == variable or assignment.get(neighbor) == value
        ]
        if conflicts:
            steps.extend(
                Step(assign=variable, value=value, action="conflict", conflict_with=neighbor)
                for neighbor in conflicts
            )
            continue

        assignment[variable] = value
        steps.append(Step(assign=variable, value=value, action="assign"))
        if depth + 1 == len(csp.variables):
            return SolveResponse(
                success=True, solution=assignment, steps=steps, backtrack_count=backtracks
            )

        domains = frame.domains
        if propagate is not None:
            domains, empty_domains = propagate(neighbors, value, assignment, domains)
            if empty_domains:
                steps.extend(
                    Step(assign=variable, value=value, action="conflict", conflict_with=neighbor)
                    for neighbor in empty_domains
                )
                undo(variable)
                continue

        next_variable = csp.variables[depth + 1]
        stack.append(SearchFrame(domains, iter(domains[next_variable])))

    return SolveResponse(success=False, solution={}, steps=steps, backtrack_count=backtracks)
