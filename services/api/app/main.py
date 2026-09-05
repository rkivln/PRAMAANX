from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from .config import settings
from .dependencies import get_supabase, get_supabase_admin, get_current_officer, get_supervisor_officer, get_admin_officer
from .api import auth, checkpoints, verifications, history, reviews, audit, admin, system
from supabase import Client

logger = logging.getLogger(__name__)

app = FastAPI(
    title="PRAMAANX API",
    description="Identity & Document Verification System Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def request_middleware(request, call_next):
    start = time.time()
    request_id = request.headers.get("X-Request-ID", str(time.time()))
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as exc:
        logger.exception("Unhandled exception", extra={"request_id": request_id})
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
        )

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "pramaanx-api", "version": "1.0.0"}

# Dashboard router
dashboard_router = APIRouter()

@dashboard_router.get("/", response_model=dict)
async def get_dashboard(
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    from .services.dashboard_service import DashboardService
    service = DashboardService(supabase)
    return await service.get_dashboard(officer)

app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(checkpoints.router, prefix="/api/checkpoints", tags=["checkpoints"])
app.include_router(verifications.router, prefix="/api/verifications", tags=["verifications"])
app.include_router(history.router, prefix="/api/history", tags=["history"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
