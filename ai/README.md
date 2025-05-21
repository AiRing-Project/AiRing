# Get_started_LiveAPI

## 프로젝트 소개

Google Gemini API를 활용한 음성 기반 대화형 일기 도우미입니다.  
사용자가 마이크로 답변하면 AI가 자연스럽고 친근하게 대화를 이어가며, 일기 작성에 도움이 되는 질문을 해줍니다.

---

## 설치 방법

1. **필수 라이브러리 설치**

```bash
pip install -r requirements.txt
```

2. **.env 파일 생성**

- 프로젝트 루트(최상위 폴더)에 `.env` 파일을 만듭니다.
- 아래와 같이 API 키를 입력하세요.

  ```bash
  GOOGLE_API_KEY=여기에_본인의_API_KEY_입력
  ```

3. **Google API Key 발급 방법**

- [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키를 생성할 수 있습니다.
- 생성한 키를 `.env` 파일에 입력하세요.

---

## 실행 방법

```bash
python Get_started_LiveAPI.py
```

- 실행 전 마이크가 정상적으로 연결되어 있는지 확인하세요.
- 첫 실행 시 마이크 접근 권한을 허용해야 할 수 있습니다.
- **에코(울림) 및 잡음을 방지하기 위해 헤드폰(이어폰) 사용을 권장합니다.**
- **프로그램 실행을 종료하려면 터미널에서 `Ctrl + C`를 누르세요.**

---

## 파일 구조 예시

```bash
프로젝트_폴더/
├── Get_started_LiveAPI.py
├── requirements.txt
├── .env
└── README.md
```

---

## 주의사항

- `.env` 파일에는 API 키 등 민감 정보만 입력하세요.
- `.env` 파일은 절대 깃허브 등 공개 저장소에 올리지 마세요.
- API 키가 노출된 경우, 즉시 키를 폐기하고 새로 발급받으세요.

---

## 문의

- 사용 중 문제가 발생하면 이슈를 등록하거나, 관리자에게 문의해 주세요.

---
