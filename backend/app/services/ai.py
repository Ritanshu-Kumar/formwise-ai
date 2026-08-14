import json

from google import genai
from google.genai import types

from ..database import Settings


MODEL_NAME = "gemini-3.1-flash-lite"


def analyze_responses(
    form_title: str,
    responses: list[dict],
) -> dict:
    settings = Settings()

    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    if not responses:
        return {
            "summary": "There are no responses to analyze yet.",
            "sentiment": "neutral",
            "themes": [],
            "key_insights": [],
            "suggested_actions": [],
        }

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an AI survey analysis assistant for FormWise AI.

Analyze the responses submitted to this form.

FORM TITLE:
{form_title}

RESPONSES:
{json.dumps(responses, indent=2, default=str)}

Return ONLY valid JSON with exactly these fields:

{{
  "summary": "A concise overall summary.",
  "sentiment": "positive, neutral, negative, or mixed",
  "themes": [
    "theme 1",
    "theme 2",
    "theme 3"
  ],
  "key_insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "suggested_actions": [
    "action 1",
    "action 2"
  ]
}}

Rules:
- Base the analysis only on the supplied responses.
- Do not invent facts.
- If there are too few responses, mention that the sample size is limited.
- Keep the summary concise.
- Keep themes short.
- Make insights useful to the form owner.
- Suggested actions should be practical.
- Return JSON only.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            "Gemini returned invalid JSON."
        ) from error

    return {
        "summary": result.get("summary", ""),
        "sentiment": result.get(
            "sentiment",
            "neutral",
        ),
        "themes": result.get("themes", []),
        "key_insights": result.get(
            "key_insights",
            [],
        ),
        "suggested_actions": result.get(
            "suggested_actions",
            [],
        ),
    } 