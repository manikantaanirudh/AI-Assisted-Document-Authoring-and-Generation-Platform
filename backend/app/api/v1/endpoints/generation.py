from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section
from app.schemas.generation import GenerateRequest, GenerateResponse
from app.services.llm_service import get_llm_service
from datetime import datetime

router = APIRouter()

@router.post("/section", response_model=GenerateResponse)
async def generate_section_content(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content for a section using AI."""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get section
    section = db.query(Section).filter(
        Section.id == request.section_id,
        Section.project_id == request.project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Get neighboring sections for context
    neighboring_sections = db.query(Section).filter(
        Section.project_id == request.project_id,
        Section.id != request.section_id
    ).order_by(Section.order_index).limit(3).all()
    
    neighbors_data = [
        {"title": s.title, "content": s.content or ""}
        for s in neighboring_sections
    ]
    
    # Build prompt
    llm_service = get_llm_service()
    prompt = llm_service.build_generation_prompt(
        project_topic=project.topic,
        section_title=section.title,
        section_type=section.type.value,
        previous_content=section.content,
        neighboring_sections=neighbors_data
    )
    
    # Generate content
    try:
        generated_content = await llm_service.generate_content(prompt)
        
        # Store in database
        section.llm_raw = generated_content
        section.content = generated_content
        db.commit()
        db.refresh(section)
        
        return GenerateResponse(
            section_id=section.id,
            content=generated_content,
            llm_raw=generated_content,
            message="Content generated successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )

