from typing import Literal, Self

from pydantic import BaseModel, Field, model_validator

Algorithm = Literal["backtracking", "backtracking_with_propagation"]


class SolveRequest(BaseModel):
    districts: list[str] = Field(min_length=1)
    zone_types: list[str] = Field(min_length=1)
    edges: list[tuple[str, str]]
    algorithm: Algorithm
    variable_order: list[str]
    value_order: list[str]

    @model_validator(mode="after")
    def validate_graph(self) -> Self:
        for label, names, order in (
            ("districts", self.districts, self.variable_order),
            ("zone_types", self.zone_types, self.value_order),
        ):
            if any(not name.strip() for name in names):
                raise ValueError(f"{label} must contain non-blank names")
            if len(names) != len(set(names)):
                raise ValueError(f"{label} must contain unique names")
            if len(order) != len(names) or set(order) != set(names):
                order_label = "variable_order" if label == "districts" else "value_order"
                raise ValueError(f"{order_label} must list every entry in {label} exactly once")

        districts = set(self.districts)
        if any(left not in districts or right not in districts for left, right in self.edges):
            raise ValueError("every edge endpoint must be a known district")
        return self


class Step(BaseModel):
    assign: str
    value: str
    action: Literal["assign", "conflict", "backtrack"]
    conflict_with: str | None = None


class SolveResponse(BaseModel):
    success: bool
    solution: dict[str, str]
    steps: list[Step]
    backtrack_count: int
