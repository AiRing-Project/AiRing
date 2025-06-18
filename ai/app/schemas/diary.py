from pydantic import BaseModel, Field


class Message(BaseModel):
    from_: str = Field(alias="from")
    message: str
