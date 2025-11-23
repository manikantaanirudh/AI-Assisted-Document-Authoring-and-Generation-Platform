from pydantic import BaseModel
from uuid import UUID

class GenerateRequest(BaseModel):
    project_id: UUID
    section_id: UUID

class GenerateResponse(BaseModel):
    section_id: UUID
    content: str
    llm_raw: str
    message: str

