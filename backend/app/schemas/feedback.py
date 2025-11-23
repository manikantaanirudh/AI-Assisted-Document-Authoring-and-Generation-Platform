from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class FeedbackCreate(BaseModel):
    project_id: UUID
    section_id: UUID
    liked: bool

class FeedbackResponse(BaseModel):
    id: UUID
    section_id: UUID
    project_id: UUID
    user_id: UUID
    liked: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

