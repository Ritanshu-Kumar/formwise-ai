# FormWise AI

A deployed end-to-end form platform for creating, publishing, collecting, and analyzing form responses with AI.

**Live app:** https://formwise-ai-seven.vercel.app/  
**API docs:** https://formwise-ai-backend.onrender.com/docs

![Landing page](docs/screenshots/landing.png)

---

## What it does

FormWise AI turns the full form workflow into one application:

1. Build a form with a visual editor.
2. Publish it as a shareable public URL.
3. Collect responses in PostgreSQL.
4. Analyze the collected responses with Gemini.
5. Surface a summary, sentiment, themes, key insights, and suggested actions.

The project started as a Vibe Coding competition prototype and was independently extended into a deployed full-stack product.

## Product flow

```text
Form Builder
     │
     ▼
Publish Form
     │
     ▼
Public Response URL
     │
     ▼
PostgreSQL
     │
     ▼
Gemini Analysis
     │
     ▼
Summary · Sentiment · Themes · Insights · Actions
```

## Screenshots

### Form builder

![Form builder](docs/screenshots/form-builder.png)

### AI insights

![AI insights](docs/screenshots/ai-insights.png)

## Architecture

![Architecture diagram](docs/architecture.png)

The Next.js frontend communicates with the FastAPI backend over REST. The backend owns form and response persistence through PostgreSQL and calls Gemini when analysis is requested.

## Features

### Form builder

- Create and edit forms
- Text, email, textarea, dropdown, and checkbox fields
- Required fields
- Field reordering and deletion
- Editable dropdown and checkbox options
- Live preview

### Publishing and responses

- Publish forms with shareable URLs
- Public response collection
- PostgreSQL persistence
- Response list and individual submission views

### AI analysis

- Gemini-powered response analysis
- Overall summary
- Sentiment classification
- Common themes
- Key insights
- Suggested actions
- Structured JSON output from the model

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | PostgreSQL via Supabase |
| AI | Google Gemini / Google GenAI SDK |
| Deployment | Vercel, Render, Supabase |
| Local development | Docker Compose |

## Repository structure

```text
formwise-ai/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── analysis.py
│   │   │   ├── forms.py
│   │   │   └── responses.py
│   │   ├── services/
│   │   │   └── ai.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
│
├── docs/
│   ├── architecture.png
│   └── screenshots/
│
├── tests/
├── docker-compose.yml
└── README.md
```

## API

Interactive Swagger documentation:

https://formwise-ai-backend.onrender.com/docs

Core routes include:

```text
GET/POST              /api/forms
GET/PUT/DELETE        /api/forms/{form_id}
POST                  /api/forms/{form_id}/publish
POST                  /api/forms/{form_id}/analyze
GET                   /health
```

## AI analysis behavior

The backend sends the form title and collected responses to Gemini and requests a structured JSON result containing:

```json
{
  "summary": "...",
  "sentiment": "positive | neutral | negative | mixed",
  "themes": [],
  "key_insights": [],
  "suggested_actions": []
}
```

The analysis prompt instructs the model to use only the supplied responses, avoid invented facts, and acknowledge when the sample size is limited.

## Running locally

### Requirements

- Python 3.12+
- Node.js
- Docker Desktop
- A Gemini API key

### 1. Clone

```bash
git clone https://github.com/Ritanshu-Kumar/formwise-ai.git
cd formwise-ai
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

The development database is exposed on port `5432`.

### 3. Backend

```bash
cd backend
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```text
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### 4. Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## Local verification

The repository includes lightweight contract tests that do not require the database, Gemini API key, or a running frontend.

```bash
python -m unittest discover -s tests -v
```

For frontend validation:

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

The current deployment is split into three services:

```text
Frontend → Vercel
Backend  → Render
Database → Supabase PostgreSQL
```

The repository also includes Docker Compose for local PostgreSQL development.

## Environment variables

Never commit secrets.

Backend:

```text
DATABASE_URL=
GEMINI_API_KEY=
```

Frontend:

```text
NEXT_PUBLIC_API_URL=
```

The repository's ignore rules exclude local `.env` files and common generated artifacts.

## What I learned

This project was built to move beyond a simple AI demo and exercise the full product path:

- translating a prototype into a maintainable full-stack application
- designing REST APIs around a real product workflow
- integrating PostgreSQL persistence
- connecting a production frontend to a deployed backend
- integrating structured LLM output into an application flow
- handling deployment across multiple services
- debugging frontend/backend integration issues
- turning an initial prototype into a usable deployed product

## Current scope and limitations

The current version is intentionally a focused product prototype rather than a complete SaaS platform.

Known gaps include:

- authentication and multi-user workspaces
- conditional form logic
- CSV/PDF export
- embeddable forms
- more extensive automated integration tests
- formal evaluation of AI analysis quality

## Roadmap

Planned product improvements include:

- authentication and workspace support
- conditional form logic
- response export
- embeddable forms
- stronger AI evaluation and regression tests

## License

For educational and personal project use.
