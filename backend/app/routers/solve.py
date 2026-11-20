from fastapi import APIRouter

from ..models import SolveRequest, SolveResponse
from ..solver import backtracking, constraint_propagation
from ..solver.csp_engine import CSP

router = APIRouter(prefix="/api")
solvers = {
    "backtracking": backtracking.solve,
    "backtracking_with_propagation": constraint_propagation.solve,
}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/solve", response_model=SolveResponse, response_model_exclude_none=True)
def solve(request: SolveRequest) -> SolveResponse:
    return solvers[request.algorithm](CSP.from_request(request))
