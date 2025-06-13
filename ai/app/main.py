from fastapi import APIRouter, FastAPI

from routes import auth

app = FastAPI(title="AiRing", description="AiRing AI Server")


@app.get("/health-check", tags=["System"])
def health_check():
    return {"status": "ok"}


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)

app.include_router(api_router)
