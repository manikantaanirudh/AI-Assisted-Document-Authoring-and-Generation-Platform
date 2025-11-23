from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title="AI Document Authoring Platform",
    description="AI-powered document generation and refinement platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
cors_origins = settings.CORS_ORIGINS.split(",") if "," in settings.CORS_ORIGINS else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "AI Document Authoring Platform API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

