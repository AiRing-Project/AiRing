from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["system"])


@router.get("/", include_in_schema=False)
def root():
    return FileResponse("static/index.html")


@router.get("/health-check")
def health_check():
    return {"status": "ok"}
