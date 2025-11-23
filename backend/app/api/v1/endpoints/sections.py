from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section, SectionType
from app.schemas.section import SectionCreate, SectionUpdate, SectionResponse

router = APIRouter()

@router.post("/{project_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    project_id: UUID,
    section_data: SectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new section for a Word document or slide for a PowerPoint presentation."""
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Determine section type based on document type
    section_type = SectionType.SECTION if project.doc_type.value == "docx" else SectionType.SLIDE
    
    new_section = Section(
        project_id=project_id,
        type=section_type,
        title=section_data.title,
        order_index=section_data.order_index
    )
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section

@router.put("/{project_id}/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    project_id: UUID,
    section_id: UUID,
    section_data: SectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a section."""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    section = db.query(Section).filter(
        Section.id == section_id,
        Section.project_id == project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    if section_data.title is not None:
        section.title = section_data.title
    if section_data.content is not None:
        section.content = section_data.content
    if section_data.order_index is not None:
        section.order_index = section_data.order_index
    
    db.commit()
    db.refresh(section)
    return section

@router.delete("/{project_id}/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    project_id: UUID,
    section_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a section."""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    section = db.query(Section).filter(
        Section.id == section_id,
        Section.project_id == project_id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    db.delete(section)
    db.commit()
    return None

