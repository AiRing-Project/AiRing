import os
from transformers import AutoTokenizer, AutoConfig, AutoModelForSequenceClassification
import torch
import numpy as np
from kss import split_sentences

# 감정 라벨 (학습시 사용한 순서와 동일하게!)
EMOTION_LABELS = [
    '감사한','그저 그런','기쁜','당황한','만족스러운','분노한','불안한',
    '스트레스 받는','슬픈','외로운','우울한','자신하는','편안한','흥분한'
]

MODEL_PATH = os.path.abspath(os.path.dirname(__file__))
TOKENIZER_NAME = "hun3359/klue-bert-base-sentiment"
MAX_TOKEN = 512
THRESHOLD = 0.54  # 최적 threshold

# 토크나이저와 모델 로드
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_NAME)
config = AutoConfig.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, config=config)
model.eval()

def chunk_text_with_kss(text, tokenizer, max_tokens=512):
    """
    긴 텍스트를 문장 단위로 쪼개고, 512토큰 이하로 chunk를 묶음.
    한 문장이 512토큰을 넘으면 단어 단위로도 쪼갬.
    """
    sentences = split_sentences(str(text))
    chunks = []
    current_chunk = []
    current_length = 0
    for sentence in sentences:
        encoded = tokenizer.encode(sentence, add_special_tokens=True)
        tokenized_len = len(encoded)
        if tokenized_len > max_tokens:
            # 문장이 너무 길면 단어 단위로 쪼갬
            words = sentence.split()
            chunk = []
            chunk_len = 0
            for word in words:
                word_encoded = tokenizer.encode(word, add_special_tokens=False)
                word_len = len(word_encoded)
                if chunk_len + word_len > max_tokens:
                    chunks.append(' '.join(chunk))
                    chunk = []
                    chunk_len = 0
                chunk.append(word)
                chunk_len += word_len
            if chunk:
                chunks.append(' '.join(chunk))
            current_length = 0
            current_chunk = []
            continue
        if current_length + tokenized_len <= max_tokens:
            current_chunk.append(sentence)
            current_length += tokenized_len
        else:
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentence]
            current_length = tokenized_len
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    return chunks

def predict_emotions(text: str, threshold: float = THRESHOLD):
    """
    입력 텍스트의 감정을 멀티라벨로 예측.
    512토큰 초과시 chunk별 예측 후 평균 확률 사용.
    반환값: 감정 리스트
    """
    # 입력 텍스트 토큰 개수 확인
    encoded = tokenizer.encode(text, add_special_tokens=True)
    if len(encoded) <= MAX_TOKEN:
        # 512토큰 이하: 바로 예측
        inputs = tokenizer(
            text, return_tensors="pt", truncation=True, max_length=MAX_TOKEN, padding="max_length"
        )
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits if hasattr(outputs, "logits") else outputs["logits"]
            probs = torch.sigmoid(logits).cpu().numpy()[0]
        predicted = [EMOTION_LABELS[i] for i, p in enumerate(probs) if p >= threshold]
        return predicted
    else:
        # 512토큰 초과: chunk로 분할 후 chunk별 예측, 평균 확률 산출
        chunks = chunk_text_with_kss(text, tokenizer, max_tokens=MAX_TOKEN)
        all_probs = []
        for chunk in chunks:
            inputs = tokenizer(
                chunk, return_tensors="pt", truncation=True, max_length=MAX_TOKEN, padding="max_length"
            )
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits if hasattr(outputs, "logits") else outputs["logits"]
                probs = torch.sigmoid(logits).cpu().numpy()[0]
                all_probs.append(probs)
        mean_probs = np.mean(all_probs, axis=0)
        predicted = [EMOTION_LABELS[i] for i, p in enumerate(mean_probs) if p >= threshold]
        return predicted
