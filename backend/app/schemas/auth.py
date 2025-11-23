from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[UUID] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: str
    
    class Config:
        from_attributes = True

