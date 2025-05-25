from google import genai
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# .env 파일에서 API 키 로드
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")

client = genai.Client(api_key=api_key)

def load_conversation():
    try:
        with open('conversation_log.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("대화 기록 파일을 찾을 수 없습니다.")
        return None

def save_summary(summary):
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"summary_{today}.txt"
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(summary)
        print(f"일기가 {filename}에 저장되었습니다.")
    except Exception as e:
        print(f"일기 저장 중 오류가 발생했습니다: {e}")

def generate_diary(chat_history):
    prompt = f"""아래 대화 내용을 바탕으로 오늘의 일기를 3~5문장으로 작성해줘.
각 문장은 새로운 줄에 작성해줘.

{chat_history}
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=[prompt],
    )
    
    # 응답 텍스트를 문장 단위로 분리하고 줄바꿈 추가
    sentences = response.text.split('. ')
    formatted_text = '.\n'.join(sentences)
    if not formatted_text.endswith('.'):
        formatted_text += '.'
    
    return formatted_text

def main():
    # 대화 기록 로드
    conversation = load_conversation()
    if not conversation:
        return
    
    # 대화 기록을 문자열로 변환
    chat_history = "\n".join([f"{msg['role']}: {msg['text']}" for msg in conversation])
    
    # 일기 생성
    summary = generate_diary(chat_history)
    
    # 일기 저장
    save_summary(summary)

if __name__ == "__main__":
    main() 