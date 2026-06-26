from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Users
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# Forms
class FormBase(BaseModel):
    title: str
    fields: List[Dict[str, Any]] = []
    workflows: List[Dict[str, Any]] = []
    theme: Optional[str] = "theme-blue"
    cover_image: Optional[str] = None
    logo: Optional[str] = None
    max_responses: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_published: bool = False

class FormCreate(FormBase):
    id: Optional[str] = None # Optional because we can let frontend dictate ID or generate on backend

class FormUpdate(FormBase):
    pass

class FormResponse(FormBase):
    id: str
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    submission_count: Optional[int] = 0
    class Config:
        from_attributes = True

# Submissions
class SubmissionCreate(BaseModel):
    answers: Dict[str, Any]

class SubmissionResponse(BaseModel):
    id: int
    form_id: str
    answers: Dict[str, Any]
    submitted_at: datetime
    class Config:
        from_attributes = True
