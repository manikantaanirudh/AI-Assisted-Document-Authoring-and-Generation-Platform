from sqlalchemy import Column, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    liked = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("Section", back_populates="feedbacks")
    project = relationship("Project")
    user = relationship("User")

