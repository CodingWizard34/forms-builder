from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    form_id = form.id if form.id else str(uuid.uuid4())[:8]
    
    # Check if form exists for update
    existing_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    
    if existing_form:
        if existing_form.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this form")
            
        existing_form.title = form.title
        existing_form.fields = form.fields
        existing_form.workflows = form.workflows
        existing_form.theme = form.theme
        existing_form.cover_image = form.cover_image
        existing_form.logo = form.logo
        existing_form.max_responses = form.max_responses
        existing_form.expires_at = form.expires_at
        existing_form.is_published = form.is_published
        db.commit()
        db.refresh(existing_form)
        return existing_form
        
    db_form = models.Form(
        id=form_id,
        title=form.title,
        fields=form.fields,
        workflows=form.workflows,
        theme=form.theme,
        cover_image=form.cover_image,
        logo=form.logo,
        max_responses=form.max_responses,
        expires_at=form.expires_at,
        is_published=form.is_published,
        user_id=current_user.id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@router.get("/", response_model=List[schemas.FormResponse])
def get_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    forms = db.query(models.Form).filter(models.Form.user_id == current_user.id).offset(skip).limit(limit).all()
    return forms

@router.get("/{form_id}", response_model=schemas.FormResponse)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    submission_count = db.query(models.Submission).filter(models.Submission.form_id == form_id).count()
    
    # Return as dict to satisfy Pydantic schema with submission_count
    result = form.__dict__.copy()
    result["submission_count"] = submission_count
    return result

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this form")
        
    db.delete(form)
    db.commit()
    return None
