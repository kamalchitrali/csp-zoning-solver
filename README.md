# CSP Zoning Solver

A stateless FastAPI and React app for graph coloring. Districts are variables, zone types are possible values, and an edge requires its endpoints to use different zones.

## Run locally

Install Python 3.11+ and Node.js 20.19+ or 22.12+ (or a newer supported release).

In one terminal, from the project root:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell, use `py -3 -m venv .venv` and `.venv\Scripts\Activate.ps1` for the first two Python setup commands.

In another terminal, from the project root:

```sh
cd frontend
npm ci
npm run dev
```

Open [the app](http://localhost:5173). The frontend uses [the API](http://localhost:8000) by default. FastAPI allows requests from Vite on port 5173 using either `localhost` or `127.0.0.1`.

## Use the visualizer

1. Load the six-district preset or enter district and zone names separated by commas or newlines. The listed order determines the order of districts and zone values during the search.
2. Enter one edge per line, such as `D1, D2`. Leave the field empty for a graph with no edges.
3. Pick **Backtracking**, **Forward checking**, or **Compare both**, then select **Run solver**. The preset uses 9 backtracks with plain backtracking and 5 with forward checking.
4. Inspect the final assignments or select a row in **Search trace** to replay that event on the graph. In comparison mode, use the trace selector to switch algorithms.

## API

- `GET /api/health` returns `{"status":"ok"}`.
- `POST /api/solve` accepts `districts`, `zone_types`, `edges`, `algorithm`, `variable_order`, and `value_order`. Both orders must list every corresponding name exactly once. The algorithm is `backtracking` or `backtracking_with_propagation`.
- The JSON response contains `success`, `solution`, `steps`, and `backtrack_count`. A valid unsatisfiable graph returns HTTP 200 with `success: false` and an empty solution. Invalid requests return HTTP 422.

Each tried value is recorded as an assignment or one or more conflicts. Forward checking skips values removed from the domains of unassigned neighbors. If an assignment empties a neighbor’s domain, the trace records a conflict with that neighbor and then an undo. The backtrack count is the number of assignments undone. Both algorithms preserve the chosen variable and value orders.

[Interactive API docs](http://localhost:8000/docs) are available while the backend is running.

## Verify

In the backend virtual environment, run `python -m pytest -q` from `backend/`. In `frontend/`, run `npm run build` to produce the static bundle in `frontend/dist/`.

See the [backend README](backend/README.md) and [frontend README](frontend/README.md) for component details.
