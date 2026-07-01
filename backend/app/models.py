from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile Data
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    
    forms = relationship("Form", back_populates="owner")

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, index=True) # E.g., 'xyz123'
    title = Column(String, nullable=False, default="Untitled Form")
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Store the complex arrays as JSON
    fields = Column(JSON, default=[])
    workflows = Column(JSON, default=[])
    theme = Column(String, default="theme-blue")
    
    cover_image = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    max_responses = Column(Integer, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="forms")
    submissions = relationship("Submission", back_populates="form", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(String, ForeignKey("forms.id"))
    
    # Store dynamic answers as JSON map
    answers = Column(JSON, default={})
    
    submitted_at = Column(DateTime, default=datetime.utcnow)

    form = relationship("Form", back_populates="submissions")
