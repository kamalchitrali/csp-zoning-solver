# Frontend

Run `npm ci` followed by `npm run dev` from this directory. Start the backend as described in the [root README](../README.md).

Vite uses the root `index.html` as its entry and builds to `dist/` with `npm run build`. The app uses `http://localhost:8000` by default. To change the API base URL, set `VITE_API_URL` in a local `.env.local` file before starting Vite or building. When hosting the frontend on a separate origin, allow that origin in the backend CORS configuration.
