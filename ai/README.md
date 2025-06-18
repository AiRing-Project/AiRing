<p align="center">
  <a href="https://fastapi.tiangolo.com/ko/" target="blank"><img src="https://github.com/fastapi/fastapi/blob/master/docs/en/docs/img/logo-margin/logo-teal.svg" alt="FastAPI Logo" /></a>
</p>

# AiRing AI

Python 및 FastAPI 기반으로 구축된 AI 백엔드 서버입니다.

## 기술 스택

-   Python3
-   FastAPI
-   PyTorch
-   Hugging Face

## 설치 방법

### 0. 프로젝트 폴더로 이동

```bash
cd app
```

### 1. 가상환경 구축

-   가상환경 생성
    ```bash
    python -m venv .venv
    ```
    -   `app` 폴더 하위에 `.venv`이라는 폴더가 생성됨
-   가상환경 활성화
    -   Windows PowerShell
        ```bash
        .venv\Scripts\Activate.ps1
        ```
    -   Windows Bash, Git Bash
        ```bash
        source .venv/Scripts/activate
        ```
    -   Linux, macOS
        ```bash
        source .venv/bin/activate
        ```
-   활성화 확인
    ```bash
    where python
    ```
    또는
    ```bash
    where pip
    ```
    `(.venv)`이라고 떠야 함
-   가상환경 비활성화
    ```bash
    deactivate
    ```
-   가상환경 내 패키지 리스트
    ```bash
    pip freeze
    ```
-   requirements.txt 생성
    ```bash
    pip freeze > requirements.txt
    ```
-   가상환경 삭제
    -   `.venv` 폴더 삭제

### 2. 필수 라이브러리 설치

```bash
pip install -r requirements.txt
```

### 3. `.env` 파일 생성

-   프로젝트 루트에 `.env` 파일을 만듭니다.
-   아래와 같이 API 키를 입력하세요.

    ```bash
    GEMINI_API_KEY=your-api-key
    OPENAI_API_KEY=your-api-key
    ```

## 애플리케이션 실행

> [!IMPORTANT]
> 반드시 `ai` 폴더가 아니라 **`app` 폴더**를 code editor에서 프로젝트로 열기
> 반드시 `app` 폴더 기준 **절대 경로**로 import

-   개발 서버 실행
    ```bash
    uvicorn main:app --reload
    ```
-   프로덕션 환경 테스트
    ```bash
    uvicorn main:app
    ```

## 프로젝트 폴더 구조

```
ai/
├── .gitignore                # Git에서 무시할 파일/폴더 목록
├── README.md                 # 프로젝트 설명서
├── notebooks/                # Colab(학습/실험/분석) 코드 모음
├── data/                     # (옵션) 데이터셋 저장 폴더
└── app/                      # 실제 FastAPI 및 서비스 코드
    ├── .venv/                # Python 가상환경 폴더 (패키지, 실행환경 등)
    ├── .env                  # 환경변수 파일 (API 키 등, 직접 생성 필요)
    ├── requirements.txt      # Python 패키지 의존성 목록
    ├── __init__.py           # 패키지 초기화 파일 (비어있어도 무방)
    ├── main.py               # FastAPI 앱 실행 진입점
    │
    ├── core/                 # 핵심 설정 및 유틸리티 모듈
    │   └── config.py         # 환경설정, Settings 클래스 등
    │
    ├── routes/               # FastAPI 라우터(엔드포인트) 모음
    │   ├── __init__.py
    │   └── ...               # 예: auth.py, diary.py 등 엔드포인트별 파일
    │
    ├── services/             # 비즈니스 로직, 외부 API 연동 등 서비스 계층
    │   ├── __init__.py
    │   └── ...               # 예: auth.py, diary.py 등
    │
    ├── schemas/              # Pydantic 데이터 모델(요청/응답 스키마) 정의
    │   ├── __init__.py
    │   └── ...               # 예: auth.py, diary.py 등
    │
    └── models/               # AI 모델 가중치, 모델 정의 코드, 토크나이저 등
        ├── __init__.py
        ├── my_model.pt       # (예시) PyTorch 모델 가중치 파일
        ├── tokenizer.json    # (예시) 토크나이저 파일
        ├── model_def.py      # (예시) 모델 구조/로딩/추론 코드
        └── ...
```

### Naming Convention

| 구분                               | 형식                      |
| ---------------------------------- | ------------------------- |
| 파일/모듈/패키지, 함수·변수·메서드 | snake_case                |
| 클래스                             | PascalCase                |
| 상수                               | ALL_CAPS_WITH_UNDERSCORES |
| JSON 응답                          | camelCase                 |
