from fastapi import APIRouter, FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from routes import auth

app = FastAPI(title="AiRing", description="AiRing AI Server")


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", include_in_schema=False)
def root():
    return FileResponse("static/index.html")


@app.get("/health-check", tags=["System"])
def health_check():
    return {"status": "ok"}


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)

app.include_router(api_router)
