from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Form
from ..schemas import FormCreate, FormOut, FormUpdate


router = APIRouter(
    prefix="/api/forms",
    tags=["forms"],
)


@router.post(
    "",
    response_model=FormOut,
    status_code=status.HTTP_201_CREATED,
)
def create_form(
    payload: FormCreate,
    db: Session = Depends(get_db),
):
    form = Form(
        title=payload.title,
        description=payload.description,
        fields=[
            field.model_dump()
            for field in payload.fields
        ],
        published=False,
    )

    db.add(form)
    db.commit()
    db.refresh(form)

    return form

@router.get(
    "",
    response_model=list[FormOut],
)
def list_forms(
    db: Session = Depends(get_db),
):
    forms = (
        db.query(Form)
        .order_by(Form.created_at.desc())
        .all()
    )

    return forms

@router.get(
    "",
    response_model=list[FormOut],
)
def list_forms(
    db: Session = Depends(get_db),
):
    return (
        db.query(Form)
        .order_by(Form.created_at.desc())
        .all()
    )

@router.get(
    "/{form_id}",
    response_model=FormOut,
)
def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    return form


@router.put(
    "/{form_id}",
    response_model=FormOut,
)
def update_form(
    form_id: UUID,
    payload: FormUpdate,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    if payload.title is not None:
        form.title = payload.title

    if payload.description is not None:
        form.description = payload.description

    if payload.fields is not None:
        form.fields = [
            field.model_dump()
            for field in payload.fields
        ]

    db.commit()
    db.refresh(form)

    return form


@router.post(
    "/{form_id}/publish",
    response_model=FormOut,
)
def publish_form(
    form_id: UUID,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    form.published = True

    db.commit()
    db.refresh(form)

    return form

@router.get(
    "/{form_id}/responses",
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

    from ..models import Response

    responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .order_by(Response.submitted_at.desc())
        .all()
    )

    return [
        {
            "id": str(response.id),
            "form_id": str(response.form_id),
            "answers": response.answers,
            "submitted_at": response.submitted_at,
        }
        for response in responses
    ]