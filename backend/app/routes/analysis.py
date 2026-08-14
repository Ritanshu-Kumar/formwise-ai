from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Form, Response
from ..services.ai import analyze_responses


router = APIRouter(
    prefix="/api/forms",
    tags=["analysis"],
)


@router.post("/{form_id}/analyze")
def analyze_form(
    form_id: UUID,
    db: Session = Depends(get_db),
):
    form = db.get(Form, form_id)

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .order_by(Response.submitted_at.asc())
        .all()
    )

    response_data = [
        {
            "id": str(response.id),
            "answers": response.answers,
            "submitted_at": response.submitted_at,
        }
        for response in responses
    ]

    try:
        analysis = analyze_responses(
            form_title=form.title,
            responses=response_data,
        )

        return analysis

    except Exception as error:
        print("AI analysis error:", error)

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {error}",
        )