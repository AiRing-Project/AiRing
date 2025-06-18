from typing import List

from fastapi import APIRouter

from schemas.diary import Message
from services.gpt_diary_summary import generate_diary_from_dialogue

router = APIRouter(prefix="/diary", tags=["diary"])


@router.post("/summary")
def summarize_diary(messages: List[Message]):
    raw_script = "\n".join(f"{msg.from_}: {msg.message}" for msg in messages)
    result = generate_diary_from_dialogue(raw_script)
    return result
