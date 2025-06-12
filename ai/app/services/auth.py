# https://ai.google.dev/gemini-api/docs/ephemeral-tokens?hl=ko#python 참고
import datetime

from google import genai


def create_ephemeral_token(api_key: str) -> str:
    now = datetime.datetime.now(tz=datetime.timezone.utc)

    client = genai.Client(
        api_key=api_key,
        http_options={
            "api_version": "v1alpha",
        },
    )

    auth_token = client.auth_tokens.create(
        config={
            "uses": 1,  #  한 번만 세션 시작에 사용 가능
            "expire_time": now
            + datetime.timedelta(minutes=30),  # 30분 동안 세션 유지(대화) 가능
            "new_session_expire_time": now
            + datetime.timedelta(
                minutes=1
            ),  # 토큰을 발급받은 후 1분 이내에 세션을 시작해야 함
            "http_options": {"api_version": "v1alpha"},
        }
    )

    return auth_token.name
