from typing import List

from fastapi import APIRouter

from schemas.diary import Message, DiaryEmotionRequest, DiaryEmotionResponse
from services.gpt_diary_summary import generate_diary_from_dialogue
from services.diary_emotion import analyze_diary_emotion

router = APIRouter(prefix="/diary", tags=["diary"])


@router.post("/summary")
def summarize_diary(messages: List[Message]):
    raw_script = "\n".join(f"{msg.from_}: {msg.message}" for msg in messages)
    result = generate_diary_from_dialogue(raw_script)
    return result


@router.post("/emotion", response_model=DiaryEmotionResponse)
def diary_emotion(request: DiaryEmotionRequest):
    emotion_list = analyze_diary_emotion(request.content)
    return DiaryEmotionResponse(emotionList=emotion_list)