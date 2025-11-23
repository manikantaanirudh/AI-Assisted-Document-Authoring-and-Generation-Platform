from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter()

@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a section."""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == comment_data.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify section exists
    section = db.query(Section).filter(
        Section.id == comment_data.section_id,
        Section.project_id == comment_data.project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Create comment
    comment = Comment(
        section_id=comment_data.section_id,
        project_id=comment_data.project_id,
        user_id=current_user.id,
        comment_text=comment_data.comment_text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment

