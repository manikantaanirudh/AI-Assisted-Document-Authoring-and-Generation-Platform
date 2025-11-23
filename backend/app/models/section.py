from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.core.database import Base

class SectionType(str, enum.Enum):
    SECTION = "section"  # For Word documents
    SLIDE = "slide"      # For PowerPoint

class Section(Base):
    __tablename__ = "sections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    type = Column(SQLEnum(SectionType), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)  # Section header or slide title
    content = Column(Text, nullable=True)   # Latest refined content
    llm_raw = Column(Text, nullable=True)   # Raw LLM response
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="sections")
    revisions = relationship("Revision", back_populates="section", cascade="all, delete-orphan", order_by="Revision.created_at.desc()")
    feedbacks = relationship("Feedback", back_populates="section", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="section", cascade="all, delete-orphan", order_by="Comment.created_at.desc()")

