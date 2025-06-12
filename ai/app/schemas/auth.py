from pydantic import BaseModel


class IssueEphemeralTokenResponse(BaseModel):
    ephemeralToken: str
