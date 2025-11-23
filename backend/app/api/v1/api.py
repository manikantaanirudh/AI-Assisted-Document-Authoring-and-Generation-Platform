from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, sections, generation, refinement, feedback, comments, export, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(sections.router, prefix="/projects", tags=["sections"])
api_router.include_router(generation.router, prefix="/generate", tags=["generation"])
api_router.include_router(refinement.router, prefix="/refine", tags=["refinement"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

