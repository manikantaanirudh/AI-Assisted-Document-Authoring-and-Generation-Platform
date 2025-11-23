from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CommentCreate(BaseModel):
    project_id: UUID
    section_id: UUID
    comment_text: str

class CommentResponse(BaseModel):
    id: UUID
    section_id: UUID
    project_id: UUID
    user_id: UUID
    comment_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

