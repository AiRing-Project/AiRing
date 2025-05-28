# -*- coding: utf-8 -*-
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
## Run

To run the script:

```
python Get_started_LiveAPI.py
```
"""

import asyncio
import os
import sys
import traceback
import time
import json
from typing import Dict, List, Set

import pyaudio
from google import genai
from google.genai import types
from dotenv import load_dotenv
import websockets
import aiohttp  # aiohttp 모듈 추가
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import jwt  # JWT 토큰 decode용 (예시)
from contextlib import asynccontextmanager
import weakref

load_dotenv(".env")

try:
    api_key = os.environ["GOOGLE_API_KEY"]
except KeyError as exc:
    raise RuntimeError(
        "Environment variable GOOGLE_API_KEY is not set. "
        "Create a .env file or export the variable before running."
    ) from exc

client = genai.Client(api_key=api_key)

if sys.version_info < (3, 11, 0):
    import taskgroup, exceptiongroup
    asyncio.TaskGroup = taskgroup.TaskGroup
    asyncio.ExceptionGroup = exceptiongroup.ExceptionGroup
    ExceptionGroup = exceptiongroup.ExceptionGroup

pya = pyaudio.PyAudio()

FORMAT = pyaudio.paInt16
CHANNELS = 1
SEND_SAMPLE_RATE = 24000
RECEIVE_SAMPLE_RATE = 24000
CHUNK_SIZE = 2048

MODEL = "models/gemini-2.0-flash-live-001"
DEFAULT_MODE = "none"

# 사용 가능한 음성 목록 정의
AI_VOICES = {
    "1": "Aoede",
    "2": "Puck",
    "3": "Charon",
    "4": "Kore",
    "5": "Fenrir",
    "6": "Leda",
    "7": "Orus",
    "8": "Zephyr"
}

END_KEYWORDS = ["통화 종료", "종료할게", "끝낼게", "그만하고 싶어", 
                "그만할래","그만할게", "끊을게", "끊어", "끊는다"]

# 전역 변수로 관리할 연결 및 태스크 저장소
active_sessions: Dict[str, 'AudioLoop'] = {}
shutdown_event = asyncio.Event()
shutdown_tasks = set()  # 종료 시 정리할 태스크들을 추적

# FastAPI 앱 초기화
app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 테스트용 SECRET_KEY 설정
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "test_secret_key")
print(f"[서버] JWT_SECRET_KEY {'환경 변수에서 로드됨' if os.getenv('JWT_SECRET_KEY') else '테스트용 키 사용'}")


def get_user_id_from_token(token: str) -> tuple[bool, str, str]:
    """
    JWT 토큰을 검증하고 사용자 ID를 반환합니다.

    Returns:
        tuple[bool, str, str]: (성공 여부, 사용자 ID 또는 에러 메시지, 에러 타입)
    """
    try:
        print(f"[서버] 토큰 검증 시작: {token[:6]}***{token[-6:] if len(token) > 12 else ''}")

        if not token:
            print("[서버] 토큰이 비어있습니다")
            return False, "Empty token", "FORMAT_ERROR"

        try:
            from urllib.parse import unquote
            token = unquote(token)
            print(f"[서버] URL 디코딩된 토큰: {token}")
        except Exception as e:
            print(f"[서버] URL 디코딩 실패: {str(e)}")
            return False, "Invalid token format", "FORMAT_ERROR"

        if token == "Bearer test_token":
            print("[서버] 테스트 토큰 인증 성공")
            return True, "test_user", None

        if not token.startswith("Bearer "):
            print("[서버] Bearer 접두사가 없습니다")
            return False, "Invalid token format", "FORMAT_ERROR"

        try:
            token_parts = token.split(" ", 1)
            if len(token_parts) != 2:
                print("[서버] 토큰 형식이 잘못되었습니다")
                return False, "Invalid token format", "FORMAT_ERROR"
            token_value = token_parts[1]
        except IndexError:
            print("[서버] 토큰 분리 실패")
            return False, "Invalid token format", "FORMAT_ERROR"

        try:
            payload = jwt.decode(token_value, SECRET_KEY, algorithms=["HS256"])
            print(f"[서버] JWT 토큰 검증 성공: {payload}")
            return True, payload["user_id"], None
        except jwt.ExpiredSignatureError:
            print("[서버] 토큰이 만료되었습니다")
            return False, "Token has expired", "EXPIRED"
        except jwt.InvalidTokenError as e:
            print(f"[서버] 유효하지 않은 토큰: {str(e)}")
            return False, f"Invalid token: {str(e)}", "INVALID"
        except Exception as e:
            print(f"[서버] 토큰 검증 중 오류: {str(e)}")
            return False, f"Token validation error: {str(e)}", "VALIDATION_ERROR"

    except Exception as e:
        print(f"[서버] 예상치 못한 오류: {str(e)}")
        return False, f"Unexpected error: {str(e)}", "UNEXPECTED_ERROR"


class AudioLoop:
    def __init__(self, video_mode="none", selected_voice="Aoede"):
        self.video_mode = video_mode
        self.selected_voice = selected_voice
        self.audio_in_queue = None
        self.out_queue = None
        self.session = None
        self._tasks: Set[asyncio.Task] = set()
        self.conversation_log = []
        self.ai_buffer = ""
        self.user_buffer = ""
        self.last_user_input_time = time.time()
        self.session_active = True
        self._stop_event = asyncio.Event()
        self._cleanup_lock = asyncio.Lock()
        self._input_buffer = ""
        self._last_input_time = time.time()
        self._input_buffer_timeout = 0.5
        self._last_ai_response_time = time.time()
        self._error_count = 0
        self._max_errors = 3
        self._receive_lock = asyncio.Lock()
        self.running = True
        self.websocket = None
        self._is_first_response = True
        self._is_first_response_complete = False
        self.conversation_history = []
        self._closing = False
        self._recv_lock = asyncio.Lock()

    async def process_user_input(self, text: str):
        """사용자 입력을 처리하고 AI 응답을 생성합니다."""
        try:
            print(f"[시스템] 사용자 입력 처리 시작: {text}")

            # turn_complete 신호 전송
            turn_complete_msg = {
                "client_content": {
                    "turn_complete": True
                }
            }
            await self.websocket.send_str(json.dumps(turn_complete_msg))
            print("[시스템] turn_complete 신호 전송됨")

            # AI 응답 생성
            response = await self.ai.generate_response(text)
            if response:
                print(f"[AI] {response}")
                # AI 응답을 오디오로 변환
                await self.text_to_speech(response)
            else:
                print("[시스템] AI 응답이 비어있습니다")

        except Exception as e:
            print(f"[오류] 사용자 입력 처리 중 오류: {str(e)}")
            raise

    async def stop(self):
        """세션을 안전하게 종료합니다."""
        if self._closing:
            return
        self._closing = True
        print("[시스템] 세션 종료 시작...")
        if not self.session_active:
            return
        async with self._cleanup_lock:
            if not self.session_active:
                return
            self.session_active = False
            self.running = False
            self._stop_event.set()
            # WebSocket 연결 종료 전 약간의 지연
            if self.websocket:
                try:
                    await asyncio.sleep(0.1)
                    await self.websocket.close(code=1000, reason="Normal closure")
                except Exception as e:
                    print(f"[시스템] WebSocket 종료 중 오류: {str(e)}")
            # Gemini 세션 종료
            if self.session:
                try:
                    await self.session.close()
                except Exception as e:
                    print(f"[시스템] Gemini 세션 종료 중 오류: {str(e)}")

            # 현재 실행 중인 태스크 취소
            current_task = asyncio.current_task()
            tasks_to_cancel = [t for t in list(self._tasks) if t is not current_task]

            for task in tasks_to_cancel:
                if not task.done():
                    task.cancel()

            # 모든 태스크가 완료될 때까지 대기
            if tasks_to_cancel:
                try:
                    await asyncio.gather(*tasks_to_cancel, return_exceptions=True)
                except Exception as e:
                    print(f"[시스템] 태스크 정리 중 오류: {str(e)}")

            self._tasks.clear()
            print("[시스템] 세션 종료 완료")

    def create_task(self, coro):
        """새로운 태스크를 생성하고 관리합니다."""
        task = asyncio.create_task(coro)
        self._tasks.add(task)

        def cleanup(task):
            try:
                self._tasks.discard(task)
                if not task.cancelled() and task.exception():
                    print(f"태스크 오류: {task.exception()}")
            except Exception as e:
                print(f"태스크 정리 중 오류: {str(e)}")

        task.add_done_callback(cleanup)
        return task

    async def process_audio_data(self):
        """오디오 데이터를 처리하고 전송하는 전용 태스크"""
        while not self._stop_event.is_set() and not shutdown_event.is_set():
            try:
                if not self.session:
                    await asyncio.sleep(0.1)
                    continue

                # 오디오 데이터가 있으면 즉시 전송
                if not self.audio_in_queue.empty():
                    data = await self.audio_in_queue.get()
                    if data:
                        print(f"[시스템] 오디오 데이터 즉시 전송: {len(data)} bytes")

                await asyncio.sleep(0.001)

            except Exception as e:
                print(f"[오류] 오디오 처리 중 오류: {str(e)}")
                await asyncio.sleep(0.1)

    async def receive_audio(self, session):
        try:
            # 첫 AI 응답 처리
            print("[시스템] 첫 AI 응답 생성 시작")
            print(f"[시스템] ({time.time():.2f}) AI의 첫 응답을 기다리는 중...")
            turn = session.receive()
            async for response in turn:
                if self._stop_event.is_set() or not self.running or not self.session_active:
                    print("[시스템] 세션 종료 플래그 감지, 첫 응답 루프 탈출")
                    return

                # 텍스트 응답 처리
                if hasattr(response, "server_content") and \
                   getattr(response.server_content, "output_transcription", None) and \
                   getattr(response.server_content.output_transcription, "text", None):
                    ai_text = response.server_content.output_transcription.text
                    self.conversation_history.append({"role": "assistant", "content": ai_text})
                    print(f"[서버] ({time.time():.2f}) AI 응답 텍스트 생성: {ai_text}")

                # 오디오 데이터 전송
                if data := response.data:
                    if self.websocket and not self.websocket.closed:
                        try:
                            await self.websocket.send(data)
                            print(f"[서버] ({time.time():.2f}) 오디오 데이터 전송: {len(data)} bytes")
                        except Exception as e:
                            print(f"[오류] 오디오 데이터 전송 실패: {str(e)}")
                            break

            print(f"[시스템] ({time.time():.2f}) AI 첫 응답 완전히 완료됨")
            self._is_first_response_complete = True

            # 대화 루프 (종전 로직 유지)
            while self.running and not self._closing and self.session_active:
                try:
                    if not self.websocket:
                        print("[시스템] WebSocket 연결이 없습니다.")
                        break

                    async with self._recv_lock:
                        user_input = await self.websocket.receive_bytes()

                    if not user_input:
                        continue

                    self.last_user_input_time = time.time()
                    print(f"[서버] ({self.last_user_input_time:.2f}) 사용자 오디오 데이터 수신: {len(user_input)} bytes")

                    blob = types.Blob(data=user_input, mime_type=f"audio/pcm;rate={SEND_SAMPLE_RATE}")
                    await session.send_realtime_input(audio=blob)

                    # AI 응답 수신
                    turn = session.receive()
                    async for response in turn:
                        if self._stop_event.is_set() or not self.running or not self.session_active:
                            print("[시스템] 세션 종료 플래그 감지, 대화 루프 탈출")
                            return

                        if hasattr(response, "server_content") and \
                           getattr(response.server_content, "output_transcription", None) and \
                           getattr(response.server_content.output_transcription, "text", None):
                            ai_text = response.server_content.output_transcription.text
                            self.conversation_history.append({"role": "assistant", "content": ai_text})
                            print(f"[서버] ({time.time():.2f}) AI 응답 텍스트 생성: {ai_text}")

                        if data := response.data:
                            print(f"[서버] ({time.time():.2f}) 오디오 데이터 전송: {len(data)} bytes")
                            try:
                                if not self._closing and self.websocket:
                                    await self.websocket.send_bytes(data)
                                    await asyncio.sleep(0.01)
                            except Exception as e:
                                print(f"[서버] 오디오 데이터 전송 중 오류: {str(e)}")
                                continue

                except websockets.exceptions.ConnectionClosed:
                    print("[시스템] WebSocket 연결이 종료되었습니다 (대화 루프)")
                    break
                except asyncio.CancelledError:
                    print("[시스템] receive_audio 태스크 취소됨 (대화 루프)")
                    break
                except Exception as e:
                    print(f"[시스템] 오류 발생 (대화 루프): {str(e)}")
                    break

        except Exception as e:
            print(f"[시스템] receive_audio 전체 오류: {str(e)}")
        finally:
            print("[시스템] 대화 종료 (receive_audio finally)")
            self.running = False
            self.session_active = False
            await self.stop()

    async def start_session(self):
        try:
            CONFIG = types.LiveConnectConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    language_code="ko-KR",
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=self.selected_voice
                        )
                    )
                ),
                system_instruction=types.Part(
                    text=(
                        "너는 오늘 하루 일기 작성을 돕는 대화 도우미야."
                        "사용자에게 오늘 어떤 일이 있었는지, 기분은 어땠는지, 기억에 남는 일은 무엇이었는지 자연스럽고 친근하게 차근차근 하나씩 질문해줘."
                        "일기 작성에 도움이 될 만한 질문을 이어가고, 한 번에 질문은 하나씩만 해."
                        "사용자의 대답에는 공감도 표현하기도 하고, 답변 내용에 맞는 질문도 해줘."
                        "그리고 답변은 한 문장 이내로 자연스럽게 해줘. 질문이나 답변이 끊기지 않았으면 좋겠어."
                    )
                ),
                input_audio_transcription={},
                output_audio_transcription={}
            )

            # WebSocket 연결 설정
            if not self.websocket:
                print("[시스템] WebSocket 연결이 설정되지 않았습니다")
                return

            async with client.aio.live.connect(model=MODEL, config=CONFIG) as session:
                self.session = session
                self.session_active = True
                self.audio_in_queue = asyncio.Queue(maxsize=32)
                self.out_queue = asyncio.Queue(maxsize=32)

                print("[시스템] AI와의 대화를 시작합니다...")
                print("[시스템] AI의 첫 응답을 기다리는 중...")
                # 첫 AI 응답 요청
                await self.session.send_client_content(
                    turns={
                        "role": "user",
                        "parts": [
                            {
                                "text": "오늘 하루 일기를 작성할 수 있도록 간단한 질문을 먼저 해줘. 첫 질문은 오늘 하루는 어떠셨나요? 같은 질문이면 좋겠어."
                            }
                        ],
                    },
                    turn_complete=True,
                )

                # 태스크 시작
                self.create_task(self.send_realtime())
                self.create_task(self.receive_audio(self.session))
                self.create_task(self.timeout_checker())

                while self.session_active and not self._stop_event.is_set() and not shutdown_event.is_set():
                    await asyncio.sleep(0.1)

        except Exception as e:
            print(f"[오류] 세션 시작 중 오류 발생: {str(e)}")
            await self.stop()
            raise

    # ... 이하 기존 timeout_checker, send_realtime, ConnectionManager, websocket_endpoint, select_voice, get_voices, main 로직은 변경 없습니다 ...