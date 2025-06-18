from fastapi import APIRouter, FastAPI
from fastapi.staticfiles import StaticFiles

from routes import auth, diary, system

app = FastAPI(title="AiRing", description="AiRing AI Server")


app.mount("/static", StaticFiles(directory="static"), name="static")


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(diary.router)

app.include_router(api_router)
app.include_router(system.router)
