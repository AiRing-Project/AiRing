<p align="center">
  <a href="https://fastapi.tiangolo.com/ko/" target="blank"><img src="https://github.com/fastapi/fastapi/blob/master/docs/en/docs/img/logo-margin/logo-teal.svg" alt="FastAPI Logo" /></a>
</p>

# AiRing AI

Python 및 FastAPI 기반으로 구축된 AI 백엔드 서버입니다.

## 기술 스택

-   Python
-   FastAPI

## 설치 방법

### 1. 가상환경 구축

-   가상환경 생성
    ```bash
    python -m venv .venv
    ```
    -   `.venv`이라는 폴더가 생성됨
-   가상환경 활성화
    -   Windows
        ```bash
        .venv\Scripts\activate
        ```
    -   Mac, Linux
        ```bash
        source .venv/Scripts/activate
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
    ```

### 4. Google API Key 발급 방법

-   [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키를 생성할 수 있습니다.
-   생성한 키를 `.env` 파일에 입력하세요.

## 애플리케이션 실행

-   개발 서버 실행
    ```bash
    fastapi dev
    ```
-   프로덕션 환경
    ```bash
    fastapi run
    ```

## 프로젝트 폴더 구조

```
ai/
├── .venv/                # Python 가상환경 폴더 (패키지, 실행환경 등)
├── .env                  # 환경변수 파일 (API 키 등, 직접 생성 필요)
├── .gitignore            # Git에서 무시할 파일/폴더 목록
├── requirements.txt      # Python 패키지 의존성 목록
├── README.md             # 프로젝트 설명서
└── app/                  # 실제 FastAPI 코드
    ├── __init__.py       # 패키지 초기화 파일 (비어있어도 무방)
    ├── main.py           # FastAPI 앱 실행 진입점
    │
    ├── core/             # 핵심 설정 및 유틸리티 모듈
    │   └── config.py     # 환경설정, Settings 클래스 등
    │
    ├── routes/           # FastAPI 라우터(엔드포인트) 모음
    │   ├── __init__.py
    │   └── ...           # 예: auth.py, diary.py 등 엔드포인트별 파일
    │
    ├── services/         # 비즈니스 로직, 외부 API 연동 등 서비스 계층
    │   ├── __init__.py
    │   └── ...           # 예: auth.py, diary.py 등
    │
    └── schemas/          # Pydantic 데이터 모델(요청/응답 스키마) 정의
        ├── __init__.py
        └── ...           # 예: auth.py, diary.py 등
```

### Naming Convention

| 구분                               | 형식                      |
| ---------------------------------- | ------------------------- |
| 파일/모듈/패키지, 함수·변수·메서드 | snake_case                |
| 클래스                             | PascalCase                |
| 상수                               | ALL_CAPS_WITH_UNDERSCORES |
| JSON 응답                          | camelCase                 |
