from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section
from app.models.revision import Revision
from app.schemas.refinement import RefineRequest, RefineResponse
from app.services.llm_service import get_llm_service

router = APIRouter()

@router.post("/section", response_model=RefineResponse)
async def refine_section_content(
    request: RefineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refine section content using AI based on user prompt."""
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
    
    if not section.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section has no content to refine. Generate content first."
        )
    
    old_content = section.content
    
    # Build refinement prompt
    llm_service = get_llm_service()
    prompt = llm_service.build_refinement_prompt(
        current_content=old_content,
        refinement_instruction=request.prompt,
        section_type=section.type.value
    )
    
    # Generate refined content
    try:
        new_content = await llm_service.generate_content(prompt)
        
        # Store revision
        revision = Revision(
            section_id=section.id,
            project_id=request.project_id,
            user_id=current_user.id,
            prompt=request.prompt,
            old_content=old_content,
            new_content=new_content
        )
        db.add(revision)
        
        # Update section content
        section.content = new_content
        db.commit()
        db.refresh(section)
        db.refresh(revision)
        
        return RefineResponse(
            section_id=section.id,
            old_content=old_content,
            new_content=new_content,
            revision_id=revision.id,
            message="Content refined successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine content: {str(e)}"
        )

