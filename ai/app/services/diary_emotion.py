from models.model_def import predict_emotions


def analyze_diary_emotion(content: str) -> list[str]:
    emotion_list = predict_emotions(content)
    return emotion_list
