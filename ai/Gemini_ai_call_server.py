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
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "test_secret_key")  # 테스트용 기본값 설정
print(f"[서버] JWT_SECRET_KEY {'환경 변수에서 로드됨' if os.getenv('JWT_SECRET_KEY') else '테스트용 키 사용'}")

def get_user_id_from_token(token: str) -> tuple[bool, str, str]:
    """
    JWT 토큰을 검증하고 사용자 ID를 반환합니다.
    
    Returns:
        tuple[bool, str, str]: (성공 여부, 사용자 ID 또는 에러 메시지, 에러 타입)
    """
    try:
        print(f"[서버] 토큰 검증 시작: {token}")
        
        # 토큰 형식 검증
        if not token:
            print("[서버] 토큰이 비어있습니다")
            return False, "Empty token", "FORMAT_ERROR"
            
        # URL 디코딩
        try:
            from urllib.parse import unquote
            token = unquote(token)
            print(f"[서버] URL 디코딩된 토큰: {token}")
        except Exception as e:
            print(f"[서버] URL 디코딩 실패: {str(e)}")
            return False, "Invalid token format", "FORMAT_ERROR"
            
        # 테스트용 토큰 처리
        if token == "Bearer test_token":
            print("[서버] 테스트 토큰 인증 성공")
            return True, "test_user", None
        
        # Bearer 접두사 검증
        if not token.startswith("Bearer "):
            print("[서버] Bearer 접두사가 없습니다")
            return False, "Invalid token format", "FORMAT_ERROR"
        
        # 토큰 분리
        try:
            token_parts = token.split(" ", 1)
            if len(token_parts) != 2:
                print("[서버] 토큰 형식이 잘못되었습니다")
                return False, "Invalid token format", "FORMAT_ERROR"
            token_value = token_parts[1]
        except IndexError:
            print("[서버] 토큰 분리 실패")
            return False, "Invalid token format", "FORMAT_ERROR"
        
        # JWT 검증
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

    async def stop(self):
        """세션을 안전하게 종료합니다."""
        if not self.session_active:
            return

        async with self._cleanup_lock:
            if not self.session_active:  # 이중 체크
                return

            self.session_active = False
            self._stop_event.set()

            if self.session:
                try:
                    await self.session.close()
                except Exception as e:
                    print(f"세션 종료 중 오류: {str(e)}")

            # 현재 실행 중인 태스크(자기 자신)는 제외하고 취소
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
                    print(f"태스크 정리 중 오류: {str(e)}")
            
            self._tasks.clear()

    def create_task(self, coro):
        """새로운 태스크를 생성하고 관리합니다."""
        task = asyncio.create_task(coro)
        self._tasks.add(task)
        
        def cleanup(task):
            self._tasks.discard(task)
            if task.exception():
                print(f"태스크 오류: {task.exception()}")
        
        task.add_done_callback(cleanup)
        return task

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

            async with client.aio.live.connect(model=MODEL, config=CONFIG) as session:
                self.session = session
                self.session_active = True
                self.audio_in_queue = asyncio.Queue(maxsize=192)
                self.out_queue = asyncio.Queue(maxsize=5)

                # AI의 첫 응답을 기다림
                print("AI의 첫 응답을 기다리는 중...")
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
                self.create_task(self.receive_audio())
                self.create_task(self.timeout_checker())

                # 세션이 활성화되어 있는 동안 대기
                while self.session_active and not self._stop_event.is_set() and not shutdown_event.is_set():
                    await asyncio.sleep(0.1)

        except Exception as e:
            print(f"세션 시작 중 오류 발생: {str(e)}")
            await self.stop()
            raise

    async def timeout_checker(self):
        while not self._stop_event.is_set() and not shutdown_event.is_set():
            try:
                await asyncio.sleep(1)
                if time.time() - self.last_user_input_time > 30:  
                    print("30초 무응답, 세션 종료")
                    await self.stop()
                    break
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"타임아웃 체커 오류: {str(e)}")
                break

    async def send_realtime(self):
        while not self._stop_event.is_set() and not shutdown_event.is_set():
            try:
                msg = await self.out_queue.get()
                if self._stop_event.is_set() or shutdown_event.is_set():
                    break
                if not self.session:
                    break
                blob = types.Blob(data=msg["data"], mime_type="audio/pcm;rate=16000")
                await self.session.send_realtime_input(audio=blob)
            except asyncio.CancelledError:
                break
            except Exception as e:
                if self._stop_event.is_set() or shutdown_event.is_set():
                    break
                print(f"send_realtime 오류: {str(e)}")
                continue

    async def receive_audio(self):
        while not self._stop_event.is_set() and not shutdown_event.is_set():
            try:
                if not self.session:
                    break
                turn = self.session.receive()
                current_ai_response = ""
                audio_buffer = bytearray()
                async for response in turn:
                    if self._stop_event.is_set() or shutdown_event.is_set():
                        return

                    # 사용자 음성 텍스트 처리
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "input_transcription")
                    and response.server_content.input_transcription
                    and hasattr(response.server_content.input_transcription, "text")
                    and response.server_content.input_transcription.text):
                        user_text = response.server_content.input_transcription.text
                        self.user_buffer += user_text
                        self.last_user_input_time = time.time()
                        print(f"사용자 입력: {user_text}")

                        if any(keyword in user_text for keyword in END_KEYWORDS):
                            print("사용자 종료 발화 감지, 세션 종료")
                            await self.stop()
                            return

                    # AI 응답 텍스트 처리
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "output_transcription")
                    and response.server_content.output_transcription
                    and hasattr(response.server_content.output_transcription, "text")
                    and response.server_content.output_transcription.text):
                        ai_text = response.server_content.output_transcription.text
                        current_ai_response += ai_text

                    # 턴 종료 처리
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "turn_complete")
                    and response.server_content.turn_complete):
                        if self.user_buffer.strip():
                            self.conversation_log.append({"role": "USER", "text": self.user_buffer.strip()})
                            self.user_buffer = ""
                        if current_ai_response.strip():
                            print(f"AI 응답: {current_ai_response.strip()}")
                            self.conversation_log.append({"role": "AI", "text": current_ai_response.strip()})
                            current_ai_response = ""

                    if data := response.data:
                        if not self._stop_event.is_set() and not shutdown_event.is_set():
                            # 오디오 데이터를 즉시 전송
                            await self.audio_in_queue.put(data)
                        continue

            except asyncio.CancelledError:
                break
            except Exception as e:
                if self._stop_event.is_set() or shutdown_event.is_set():
                    break
                print(f"receive_audio 오류: {str(e)}")
                continue

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.audio_loops: Dict[str, AudioLoop] = {}
        self.selected_voices: Dict[str, str] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, session_key: str, selected_voice: str = "Aoede"):
        await websocket.accept()
        async with self._lock:
            self.active_connections[session_key] = websocket
            audio_loop = AudioLoop(video_mode="none", selected_voice=selected_voice)
            self.audio_loops[session_key] = audio_loop
            active_sessions[session_key] = audio_loop
            await audio_loop.start_session()

    async def disconnect(self, session_key: str):
        async with self._lock:
            if session_key in self.active_connections:
                del self.active_connections[session_key]
                print(f"[서버] WebSocket 연결 해제: {session_key}")
            
            if session_key in self.audio_loops:
                audio_loop = self.audio_loops[session_key]
                try:
                    # AudioLoop 세션 정리
                    await audio_loop.stop()
                    # 대화 기록 저장
                    if hasattr(audio_loop, 'conversation_log'):
                        try:
                            with open(f"conversation_log_{session_key}.json", "w", encoding="utf-8") as f:
                                json.dump(audio_loop.conversation_log, f, ensure_ascii=False, indent=2)
                        except Exception as e:
                            print(f"[서버] 대화 기록 저장 중 오류: {str(e)}")
                except Exception as e:
                    print(f"[서버] 세션 종료 중 오류: {str(e)}")
                finally:
                    del self.audio_loops[session_key]
            
            if session_key in active_sessions:
                del active_sessions[session_key]

    async def send_audio(self, session_key: str, audio_data: bytes):
        if session_key in self.active_connections:
            await self.active_connections[session_key].send_bytes(audio_data)

    def set_voice(self, user_id: str, voice: str):
        self.selected_voices[user_id] = voice

    def get_voice(self, user_id: str):
        return self.selected_voices.get(user_id, "Aoede")

manager = ConnectionManager()

@app.websocket("/ws/audio")
async def websocket_endpoint(
    websocket: WebSocket,
    voice: str = Query("Aoede"),
    accessToken: str = Query(None)
):
    print(f"[서버] WebSocket 연결 요청 수신")
    print(f"[서버] 파라미터: voice={voice}, token={accessToken}")
    
    try:
        # 1. 토큰 존재 여부 확인
        if not accessToken:
            print("[서버] 토큰이 없습니다")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # 2. 토큰 검증
        print("[서버] 토큰 검증 시작")
        success, result, error_type = get_user_id_from_token(accessToken)
        print(f"[서버] 토큰 검증 결과: success={success}, result={result}, error_type={error_type}")
        
        if not success:
            print(f"[서버] 토큰 검증 실패: {result} ({error_type})")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # 3. WebSocket 연결 수락 (인증 성공 후에만)
        print("[서버] WebSocket 연결 수락 시도")
        await websocket.accept()
        print("[서버] WebSocket 연결 수락됨")

        user_id = result
        session_key = f"{user_id}_{id(websocket)}"
        print(f"[서버] 새로운 WebSocket 연결: {session_key}")
        
        # 4. AudioLoop 세션 시작
        print(f"[서버] AudioLoop 세션 시작 시도: {session_key}")
        audio_loop = AudioLoop(video_mode="none", selected_voice=voice)
        manager.audio_loops[session_key] = audio_loop
        active_sessions[session_key] = audio_loop
        manager.active_connections[session_key] = websocket
        
        # 세션을 백그라운드에서 실행
        session_task = asyncio.create_task(audio_loop.start_session())
        shutdown_tasks.add(session_task)
        
        # 세션 종료 시 정리 작업을 위한 콜백 설정
        def cleanup_session(task):
            try:
                if not task.cancelled():
                    task.result()  # 예외가 있다면 다시 발생시킴
            except asyncio.CancelledError:
                print(f"[서버] 세션 태스크 취소됨: {session_key}")
            except Exception as e:
                print(f"[서버] 세션 종료 중 오류: {str(e)}")
            finally:
                shutdown_tasks.discard(task)
                if session_key in manager.audio_loops:
                    asyncio.create_task(manager.disconnect(session_key))
        
        session_task.add_done_callback(cleanup_session)
        print(f"[서버] AudioLoop 세션 시작 완료: {session_key}")
        
        # 5. 메인 루프
        print(f"[서버] 메인 루프 시작: {session_key}")
        while True:
            if shutdown_event.is_set():
                print(f"[서버] 종료 이벤트 감지: {session_key}")
                break
                
            try:
                # 클라이언트로부터 오디오 데이터 수신
                data = await websocket.receive_bytes()
                if session_key in manager.audio_loops:
                    audio_loop = manager.audio_loops[session_key]
                    await audio_loop.out_queue.put({"data": data, "mime_type": "audio/pcm"})
                    
                    # AI 응답 오디오 데이터 처리
                    try:
                        while not audio_loop.audio_in_queue.empty():
                            response_data = await audio_loop.audio_in_queue.get()
                            if response_data:  # None이 아닌 경우에만 전송
                                print(f"[서버] 오디오 데이터 전송: {len(response_data)} bytes")
                                await manager.send_audio(session_key, response_data)
                    except Exception as e:
                        print(f"[서버] 오디오 데이터 처리 중 오류: {str(e)}")
                        
            except WebSocketDisconnect:
                print(f"[서버] WebSocket 연결 종료 감지: {session_key}")
                break
            except Exception as e:
                print(f"[서버] 메인 루프 오류: {str(e)}")
                break

    except WebSocketDisconnect:
        print(f"[서버] WebSocket 연결 종료: {session_key}")
        if 'session_key' in locals():
            await manager.disconnect(session_key)
    except Exception as e:
        print(f"[서버] WebSocket 오류: {str(e)}")
        print(f"[서버] 오류 상세: {traceback.format_exc()}")
        if 'session_key' in locals():
            await manager.disconnect(session_key)
        raise

@app.post("/select_voice")
async def select_voice(
    data: Dict = Body(...),
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    voice = data.get("voice")
    if not voice:
        raise HTTPException(status_code=400, detail="voice는 필수입니다.")
    if voice not in AI_VOICES.values():
        raise HTTPException(status_code=400, detail="지원하지 않는 voice입니다.")
    manager.set_voice(user_id, voice)
    return {"status": "success", "message": f"음성이 {voice}로 변경되었습니다."}

@app.get("/voices")
async def get_voices(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return AI_VOICES

if __name__ == "__main__":
    import signal
    import sys

    async def shutdown():
        """서버를 안전하게 종료합니다."""
        print("\n서버를 종료합니다...")
        shutdown_event.set()
        
        # 모든 세션 종료
        for session_key in list(manager.active_connections.keys()):
            if session_key in manager.audio_loops:
                audio_loop = manager.audio_loops[session_key]
                try:
                    await audio_loop.stop()
                except Exception as e:
                    print(f"세션 종료 중 오류: {str(e)}")
        
        # 현재 실행 중인 태스크(자기 자신)는 제외하고 취소
        current_task = asyncio.current_task()
        tasks_to_cancel = [t for t in list(shutdown_tasks) if t is not current_task]
        
        for task in tasks_to_cancel:
            if not task.done():
                task.cancel()
        
        # 모든 태스크가 완료될 때까지 대기
        if tasks_to_cancel:
            try:
                await asyncio.gather(*tasks_to_cancel, return_exceptions=True)
            except Exception as e:
                print(f"태스크 종료 중 오류: {str(e)}")
        
        print("서버가 안전하게 종료되었습니다.")

    def signal_handler(sig, frame):
        """시그널 핸들러"""
        print("\n종료 시그널을 받았습니다...")
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(shutdown())
        except Exception as e:
            print(f"종료 처리 중 오류: {str(e)}")
            sys.exit(1)

    # SIGINT (Ctrl+C) 시그널 핸들러 등록
    signal.signal(signal.SIGINT, signal_handler)

    try:
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            ws_ping_interval=20,     # 20초마다 ping
            ws_ping_timeout=30,      # ping 타임아웃 30초
            timeout_keep_alive=30    # keep-alive 타임아웃 30초
        )
    except KeyboardInterrupt:
        print("\n프로그램을 종료합니다...")
    except Exception as e:
        print(f"서버 실행 중 오류: {str(e)}")
    finally:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.run_until_complete(shutdown())
        except Exception as e:
            print(f"종료 처리 중 오류: {str(e)}")
            sys.exit(1)
