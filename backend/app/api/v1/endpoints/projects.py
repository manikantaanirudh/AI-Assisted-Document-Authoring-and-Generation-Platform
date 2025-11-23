from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.section import Section, SectionType
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.section import SectionCreate

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all projects for the current user."""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project."""
    new_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        doc_type=project_data.doc_type,
        topic=project_data.topic
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project details with sections."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update project configuration."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.topic is not None:
        project.topic = project_data.topic
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    return None

