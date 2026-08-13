from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Form, Response
from ..schemas import ResponseCreate, ResponseOut


router = APIRouter(
    prefix="/api/forms/{form_id}/responses",
    tags=["responses"],
)


@router.post(
    "",
    response_model=ResponseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_response(
    form_id: UUID,
    payload: ResponseCreate,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    if not form.published:
        raise HTTPException(
            status_code=403,
            detail="Form is not published",
        )

    response = Response(
        form_id=form_id,
        answers=payload.answers,
    )

    db.add(response)
    db.commit()
    db.refresh(response)

    return response


@router.get(
    "",
    response_model=list[ResponseOut],
)
def get_responses(
    form_id: UUID,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    statement = (
        select(Response)
        .where(Response.form_id == form_id)
        .order_by(Response.submitted_at.desc())
    )

    return list(
        db.scalars(statement).all()
    )