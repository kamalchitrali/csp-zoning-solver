from ..models import SolveResponse
from .csp_engine import CSP, search


def solve(csp: CSP) -> SolveResponse:
    return search(csp)
