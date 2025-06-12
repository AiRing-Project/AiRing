from fastapi import APIRouter, FastAPI

from .routes import auth

app = FastAPI(title="AiRing", description="AiRing AI Server")

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)

app.include_router(api_router)
