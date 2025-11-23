from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter()

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit like/dislike feedback for a section."""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == feedback_data.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify section exists
    section = db.query(Section).filter(
        Section.id == feedback_data.section_id,
        Section.project_id == feedback_data.project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Create feedback
    feedback = Feedback(
        section_id=feedback_data.section_id,
        project_id=feedback_data.project_id,
        user_id=current_user.id,
        liked=feedback_data.liked
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    return feedback

