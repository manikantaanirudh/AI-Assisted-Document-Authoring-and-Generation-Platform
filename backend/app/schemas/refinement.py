from pydantic import BaseModel
from uuid import UUID

class RefineRequest(BaseModel):
    project_id: UUID
    section_id: UUID
    prompt: str

class RefineResponse(BaseModel):
    section_id: UUID
    old_content: str
    new_content: str
    revision_id: UUID
    message: str

