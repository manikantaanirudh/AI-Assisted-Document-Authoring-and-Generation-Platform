from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models.project import DocumentType

class ProjectCreate(BaseModel):
    title: str
    doc_type: DocumentType
    topic: str

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None

class SectionInProject(BaseModel):
    id: UUID
    type: str
    order_index: int
    title: str
    content: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    doc_type: DocumentType
    topic: str
    created_at: datetime
    updated_at: datetime
    sections: List[SectionInProject] = []
    
    class Config:
        from_attributes = True

