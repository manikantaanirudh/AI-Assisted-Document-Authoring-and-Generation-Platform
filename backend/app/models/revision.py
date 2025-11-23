from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Revision(Base):
    __tablename__ = "revisions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)  # Refinement prompt sent to LLM
    old_content = Column(Text, nullable=True)
    new_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("Section", back_populates="revisions")
    project = relationship("Project")
    user = relationship("User")

