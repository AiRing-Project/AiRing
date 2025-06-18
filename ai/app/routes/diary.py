from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.gpt_diary_summary import generate_diary_from_dialogue

router = APIRouter()

class Message(BaseModel):
    from_: str = Field(alias="from")
    message: str

@router.post("/diary/summary")
def summarize_diary(messages: List[Message]):
    raw_script = "\n".join(f"{msg.from_}: {msg.message}" for msg in messages)
    result = generate_diary_from_dialogue(raw_script)
    return result
