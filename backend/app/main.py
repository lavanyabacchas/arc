from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import dashboard, assets, alerts, incidents, responses, analytics, audit, demo, settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed deterministic demo dataset
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="ARC — AI-Powered Critical Infrastructure Cybersecurity Platform",
    description="Enterprise SOC monitoring, anomaly detection, incident response, and AI threat analysis for simulated critical infrastructure assets.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard.router)
app.include_router(assets.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(responses.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(demo.router)
app.include_router(settings.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ARC SOC Platform API",
        "simulation_mode": True,
        "environment": "SIMULATION ENVIRONMENT"
    }
