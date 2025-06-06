from transformers import pipeline, AutoTokenizer
import requests
import datetime
import time

# 서버 설정
BASE_URL = "http://localhost:8080"
TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW5AbmF2ZXIuY29tIiwicm9sZSI6IlJPTEVfVVNFUiIsImlhdCI6MTc0OTIxNDkwNCwiZXhwIjoxNzQ5MjE4NTA0fQ.g1E7Y8RT2lr5tQKORKA798WmT8K5c5F9O5XDoHmqXxsdq5GJtYo2KsiCPC50IsQFggJBPsIzgk8ed-CpgDprnQ"
HEADERS = {"Authorization": TOKEN}

# 긴 Mock 대화
dialogue = [
    "user: 요즘 너무 피곤하고 우울해.",
    "ai: 어떤 일이 있었는지 말해줄 수 있어?",
    "user: 회사 일도 많고, 사람들과 자꾸 비교하게 돼.",
    "ai: 그럴 수 있어. 네 감정을 표현해줘서 고마워.",
    "user: 잠도 잘 못 자고, 아침에 일어나는 게 너무 힘들어.",
    "ai: 수면 패턴이 깨진 것 같아. 규칙적인 루틴을 다시 만들어보는 건 어때?",
    "user: 노력은 하는데 자꾸 무기력해지고 손에 안 잡혀.",
    "ai: 그럴 땐 작고 쉬운 일부터 시작해보는 게 좋아.",
    "user: 상사와의 갈등도 요즘 너무 스트레스야.",
    "ai: 직장에서의 관계 스트레스는 정말 큰 영향을 미치지.",
    "user: 내가 너무 예민하게 반응하는 걸까 자책하게 돼.",
    "ai: 아니야, 감정을 느끼는 건 자연스러운 일이야.",
    "user: 친구들이 다 잘나가 보이고, 나만 뒤처진 기분이야.",
    "ai: 그런 비교는 누구나 하게 돼. 네 속도도 소중해.",
    "user: 그냥 아무것도 안 하고 싶고, 자꾸 도망치고 싶어.",
    "ai: 그런 마음이 들 땐 잠시 쉬는 것도 용기야.",
    "user: 오늘도 잘 들어줘서 고마워. 조금은 나아진 것 같아.",
    "ai: 네가 이야기해준 덕분에 나도 네 마음을 알 수 있었어. 고마워."
]

# 요약 모델과 토크나이저 로딩
MODEL_NAME = "facebook/bart-large-cnn"
summarizer = pipeline("summarization", model=MODEL_NAME)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# 토큰 기준 길이 자르기 함수
def truncate_by_token_length(text, max_token_len=1024):
    tokens = tokenizer.encode(text, truncation=True, max_length=max_token_len)
    return tokenizer.decode(tokens, skip_special_tokens=True)

# 전처리 텍스트
text_input = "\n".join(dialogue)
user_only = "\n".join([line for line in dialogue if line.startswith("user:")])

# 토큰 길이 제한 적용
text_input = truncate_by_token_length(text_input)
user_only = truncate_by_token_length(user_only)

# 1. call_log 저장
started_at = datetime.datetime.utcnow().isoformat() + "Z"
resp = requests.post(
    f"{BASE_URL}/call_logs/events",
    headers=HEADERS,
    json={
        "event": "end",
        "callType": "OUTGOING",
        "startedAt": started_at,
        "rawTranscript": user_only
    }
)
print("call_log 저장:", resp.status_code, resp.text)
if resp.status_code != 200:
    exit()

# 2. call_log ID 조회
resp = requests.get(f"{BASE_URL}/call_logs/latest", headers=HEADERS)
if resp.status_code != 200:
    print("ID 조회 실패")
    exit()
CALL_LOG_ID = resp.json()["id"]
print("저장된 call_log ID:", CALL_LOG_ID)

# 3. 요약 생성 (전처리 전)
start1 = time.time()
result1 = summarizer(text_input, max_length=60, min_length=20, do_sample=False)
end1 = time.time()
summary1 = result1[0]["summary_text"]
print("\n[전처리 전 요약]")
print("내용:", summary1)
print(f"요약 시간: {end1 - start1:.2f}초")

# 4. 요약 생성 (전처리 후)
start2 = time.time()
result2 = summarizer(user_only, max_length=60, min_length=20, do_sample=False)
end2 = time.time()
summary2 = result2[0]["summary_text"]
print("\n[전처리 후 요약 (user only)]")
print("내용:", summary2)
print(f"요약 시간: {end2 - start2:.2f}초")

# 5. 요약 저장
title = summary2.split(".")[0]
emotion = ["지침"]

resp = requests.put(
    f"{BASE_URL}/call_summary/{CALL_LOG_ID}",
    headers=HEADERS,
    json={
        "title": title,
        "content": summary2,
        "emotion": emotion
    }
)
print("\n요약 저장 결과:", resp.status_code, resp.text)
