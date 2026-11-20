const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function solveGraph(problem, algorithm) {
  let response;
  try {
    response = await fetch(`${apiBase}/api/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...problem, algorithm }),
    });
  } catch {
    throw new Error('Could not reach the solver. Check that the FastAPI server is running.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail;
    const message = Array.isArray(detail) ? detail.map(({msg}) => msg).join(' ') : detail;
    throw new Error(message || `The solver returned HTTP ${response.status}.`);
  }

  return response.json();
}
