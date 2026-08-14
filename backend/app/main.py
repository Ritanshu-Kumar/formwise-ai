from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.forms import router as forms_router
from .routes.responses import router as responses_router
from .routes.analysis import router as analysis_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="FormWise AI API",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(forms_router)
app.include_router(responses_router)
app.include_router(analysis_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "formwise-api",
    }