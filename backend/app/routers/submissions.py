from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()

@router.post("/{form_id}/submit", response_model=schemas.SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_form(form_id: str, submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    # Check limits
    if form.max_responses is not None:
        count = db.query(models.Submission).filter(models.Submission.form_id == form_id).count()
        if count >= form.max_responses:
            raise HTTPException(status_code=403, detail="Form has reached its response limit.")
            
    if form.expires_at is not None:
        if datetime.utcnow() > form.expires_at:
            raise HTTPException(status_code=403, detail="Form has expired.")
        
    db_submission = models.Submission(
        form_id=form_id,
        answers=submission.answers
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

@router.get("/{form_id}/submissions", response_model=List[schemas.SubmissionResponse])
def get_submissions(form_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these submissions")
        
    submissions = db.query(models.Submission).filter(models.Submission.form_id == form_id).offset(skip).limit(limit).all()
    return submissions
