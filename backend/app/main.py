from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.solve import router

app = FastAPI(title="CSP Zoning Solver")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(router)
