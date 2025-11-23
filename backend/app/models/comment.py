from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("Section", back_populates="comments")
    project = relationship("Project")
    user = relationship("User")

