from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class SectionCreate(BaseModel):
    title: str
    order_index: int

class SectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order_index: Optional[int] = None

class SectionResponse(BaseModel):
    id: UUID
    project_id: UUID
    type: str
    order_index: int
    title: str
    content: Optional[str] = None
    llm_raw: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

