from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.core.database import Base

class DocumentType(str, enum.Enum):
    DOCX = "docx"
    PPTX = "pptx"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    doc_type = Column(SQLEnum(DocumentType), nullable=False)
    topic = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    sections = relationship("Section", back_populates="project", cascade="all, delete-orphan", order_by="Section.order_index")

