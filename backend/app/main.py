from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import forms, submissions, auth

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema for the new columns (safe to fail if they already exist)
from sqlalchemy import text
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE forms ADD COLUMN cover_image VARCHAR"))
except Exception:
    pass
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE forms ADD COLUMN logo VARCHAR"))
except Exception:
    pass
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE forms ADD COLUMN max_responses INTEGER"))
except Exception:
    pass
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE forms ADD COLUMN expires_at DATETIME"))
except Exception:
    pass

app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(forms.router, prefix=f"{settings.API_V1_STR}/forms", tags=["forms"])
app.include_router(submissions.router, prefix=f"{settings.API_V1_STR}/forms", tags=["submissions"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Form Builder SaaS API"}
