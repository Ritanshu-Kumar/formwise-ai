from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FormField(BaseModel):
    id: int
    type: str
    label: str
    required: bool = False
    options: list[str] = Field(default_factory=list)


class FormCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str = ""

    fields: list[FormField] = Field(
        default_factory=list,
    )


class FormUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    fields: list[FormField] | None = None


class FormOut(BaseModel):
    id: UUID
    title: str
    description: str
    fields: list[FormField]
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ResponseCreate(BaseModel):
    answers: dict[str, Any]


class ResponseOut(BaseModel):
    id: UUID
    form_id: UUID
    answers: dict[str, Any]
    submitted_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )