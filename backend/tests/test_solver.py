import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models import SolveRequest
from app.solver import backtracking, constraint_propagation
from app.solver.csp_engine import CSP

SOLVERS = (backtracking.solve, constraint_propagation.solve)
DATA = {
    "districts": ["A", "B", "C", "D"],
    "zone_types": ["Blue", "Red"],
    "edges": [["A", "B"], ["B", "C"], ["C", "D"]],
    "algorithm": "backtracking",
    "variable_order": ["A", "D", "B", "C"],
    "value_order": ["Red", "Blue"],
}


def test_algorithms_honor_both_orders_and_forward_checking_does_not_increase_backtracks():
    request = SolveRequest(**DATA)
    csp = CSP.from_request(request)
    plain, propagated = [solve(csp) for solve in SOLVERS]
    for result in (plain, propagated):
        assert result.success
        assert list(result.solution) == request.variable_order
        assert result.solution == {"A": "Red", "B": "Blue", "C": "Red", "D": "Blue"}
        assert (result.steps[0].assign, result.steps[0].value) == ("A", "Red")
        assert result.backtrack_count == sum(step.action == "backtrack" for step in result.steps)
    assert (plain.backtrack_count, propagated.backtrack_count) == (2, 2)
    assert [(step.assign, step.value, step.action, step.conflict_with) for step in propagated.steps[:4]] == [
        ("A", "Red", "assign", None),
        ("D", "Red", "assign", None),
        ("B", "Blue", "assign", None),
        ("B", "Blue", "conflict", "C"),
    ]


@pytest.mark.parametrize("solve", SOLVERS)
@pytest.mark.parametrize("edges", [
    [["A", "B"], ["B", "C"], ["C", "A"]],
    [["A", "A"]],
])
def test_unsatisfiable_graph_returns_an_empty_solution(solve, edges):
    request = SolveRequest(**{**DATA, "edges": edges})
    result = solve(CSP.from_request(request))
    assert not result.success
    assert result.solution == {}
    assert any(step.action == "conflict" for step in result.steps)
    assert result.backtrack_count == sum(step.action == "backtrack" for step in result.steps)


@pytest.mark.parametrize("override", [
    {"districts": []},
    {"zone_types": ["Red", "Red"]},
    {"variable_order": ["A", "A", "B", "C"]},
    {"value_order": ["Red"]},
    {"edges": [["A", "unknown"]]},
])
def test_invalid_request(override):
    with pytest.raises(ValidationError):
        SolveRequest(**{**DATA, **override})


def test_api_and_cors():
    client = TestClient(app)
    assert client.get("/api/health").json() == {"status": "ok"}
    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        response = client.options("/api/solve", headers={
            "Origin": origin, "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        })
        assert response.headers["access-control-allow-origin"] == origin
    for algorithm in ("backtracking", "backtracking_with_propagation"):
        response = client.post("/api/solve", json={**DATA, "algorithm": algorithm})
        assert response.status_code == 200
        assert response.json()["success"]
        assert response.json()["steps"][0] == {"assign": "A", "value": "Red", "action": "assign"}
    assert client.post("/api/solve", json={**DATA, "value_order": []}).status_code == 422
