from pydantic import BaseModel, Field
from typing import List

class Message(BaseModel):
    from_: str = Field(alias="from")
    message: str


class DiaryEmotionRequest(BaseModel):
    content: str

class DiaryEmotionResponse(BaseModel):
    emotion_list: List[str] = Field(..., alias="emotionList")

    class Config:
        allow_population_by_field_name = True