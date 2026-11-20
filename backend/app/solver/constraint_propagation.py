from ..models import SolveResponse
from .csp_engine import CSP, Domains, search


def forward_check(
    neighbors: tuple[str, ...], value: str, assignment: dict[str, str], domains: Domains
) -> tuple[Domains, list[str]]:
    changes: Domains = {}
    empty_domains: list[str] = []
    for neighbor in neighbors:
        if neighbor in assignment or value not in domains[neighbor]:
            continue
        remaining = tuple(option for option in domains[neighbor] if option != value)
        changes[neighbor] = remaining
        if not remaining:
            empty_domains.append(neighbor)
    return (domains | changes if changes else domains), empty_domains


def solve(csp: CSP) -> SolveResponse:
    return search(csp, propagate=forward_check)
