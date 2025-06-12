from pydantic import BaseModel


class IssueEphemeralTokenResponse(BaseModel):
    ephemeral_token: str
