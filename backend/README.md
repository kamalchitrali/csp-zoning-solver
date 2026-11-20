# Backend

Run the setup steps in the [root README](../README.md), then run `python -m uvicorn app.main:app --reload --port 8000` from this directory.

- `app/models.py` validates graph structure and search orders.
- `app/solver/csp_engine.py` builds ordered adjacency and runs the shared depth-first search.
- `app/solver/backtracking.py` runs plain backtracking.
- `app/solver/constraint_propagation.py` adds forward checking. A search frame retains its prior domains so backtracking restores pruned values.
- `app/routers/solve.py` dispatches the requested algorithm and exposes the health endpoint.

Run `python -m pytest -q` from this directory with the virtual environment active.
