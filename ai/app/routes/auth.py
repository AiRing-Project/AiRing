from app.core.config import Settings, get_settings
from fastapi import APIRouter, Depends
from app.schemas.auth import IssueEphemeralTokenResponse
from app.services.auth import create_ephemeral_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/ephemeral-token")
def issue_ephemeral_token(
    settings: Settings = Depends(get_settings),
) -> IssueEphemeralTokenResponse:
    return {"ephemeralToken": create_ephemeral_token(settings.GEMINI_API_KEY)}
