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
from typing import Dict, List

import pyaudio
from google import genai
from google.genai import types
from dotenv import load_dotenv
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import jwt  # JWT 토큰 decode용 (예시)

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
SEND_SAMPLE_RATE = 16000
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your_jwt_secret"  # 실제 서비스에 맞게 설정

def get_user_id_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]  # 실제 토큰 구조에 맞게 수정
    except Exception:
        return None

class AudioLoop:
    def __init__(self, video_mode="none", selected_voice="Aoede"):
        self.video_mode = video_mode
        self.selected_voice = selected_voice
        self.audio_in_queue = None
        self.out_queue = None
        self.session = None
        self._tasks = []
        self.receive_audio_task = None
        self.play_audio_task = None
        self.conversation_log = []
        self.ai_buffer = ""
        self.user_buffer = ""
        self.last_user_input_time = time.time()
        self.session_active = True

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

            self.session = await client.aio.live.connect(model=MODEL, config=CONFIG)
            self.session_active = True
            self.audio_in_queue = asyncio.Queue(maxsize=192)
            self.out_queue = asyncio.Queue(maxsize=5)

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

            self._tasks = [
                asyncio.create_task(self.send_realtime()),
                asyncio.create_task(self.receive_audio()),
                asyncio.create_task(self.timeout_checker())
            ]

        except Exception as e:
            print(f"세션 시작 중 오류 발생: {str(e)}")
            raise

    async def send_realtime(self):
        try:
            while self.session_active:
                try:
                    msg = await self.out_queue.get()
                    blob = types.Blob(data=msg["data"], mime_type="audio/pcm;rate=16000")
                    await self.session.send_realtime_input(audio=blob)
                except websockets.exceptions.ConnectionClosedOK:
                    # 정상적인 연결 종료
                    return
                except Exception as e:
                    if not self.session_active:
                        return
                    print(f"send_realtime 오류: {str(e)}")
                    continue
        except asyncio.CancelledError:
            return
        except Exception as e:
            print(f"send_realtime 예외: {str(e)}")
            return

    async def receive_audio(self):
        try:
            while self.session_active:
                turn = self.session.receive()
                async for response in turn:
                    if not self.session_active:
                        return

                    # 사용자 음성 텍스트 누적 (부분 응답)
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "input_transcription")
                    and response.server_content.input_transcription
                    and hasattr(response.server_content.input_transcription, "text")
                    and response.server_content.input_transcription.text):
                        user_text = response.server_content.input_transcription.text
                        self.user_buffer += user_text
                        self.last_user_input_time = time.time()  # 마지막 입력 시각 갱신

                        # 종료 발화 감지
                        if any(keyword in user_text for keyword in END_KEYWORDS):
                            print("사용자 종료 발화 감지, 세션 종료")
                            self.session_active = False
                            if self.session:
                                await self.session.close()
                            return

                    # AI 응답 텍스트 누적 (부분 응답)
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "output_transcription")
                    and response.server_content.output_transcription
                    and hasattr(response.server_content.output_transcription, "text")
                    and response.server_content.output_transcription.text):
                        
                        ai_text = response.server_content.output_transcription.text
                        self.ai_buffer += ai_text

                    # 턴 종료 신호(turn_complete)에서 한 번에 저장
                    if (
                    hasattr(response, "server_content")
                    and hasattr(response.server_content, "turn_complete")
                    and response.server_content.turn_complete):
                        
                        if self.user_buffer.strip():
                            self.conversation_log.append({"role": "USER", "text": self.user_buffer.strip()})
                            self.user_buffer = ""
                        if self.ai_buffer.strip():
                            self.conversation_log.append({"role": "AI", "text": self.ai_buffer.strip()})
                            self.ai_buffer = ""

                    if data := response.data:
                        if self.session_active:  # 세션이 활성화된 상태에서만 큐에 추가
                            self.audio_in_queue.put_nowait(data)
                        continue
                    if text := response.text:
                        print(text, end="")

                # 큐 정리
                if not self.session_active:
                    while not self.audio_in_queue.empty():
                        try:
                            self.audio_in_queue.get_nowait()
                        except asyncio.QueueEmpty:
                            break
                    return

        except asyncio.CancelledError:
            return
        except Exception as e:
            print(f"receive_audio 오류: {str(e)}")
            return

    async def timeout_checker(self):
        while self.session_active:
            await asyncio.sleep(1)
            if time.time() - self.last_user_input_time > 30:
                print("30초 무응답, 세션 종료")
                self.session_active = False
                if self.session:
                    await self.session.close()
                # 생성한 태스크만 취소
                for task in self._tasks:
                    task.cancel()
                await asyncio.gather(*self._tasks, return_exceptions=True)
                break

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.audio_loops: Dict[str, AudioLoop] = {}
        self.selected_voices: Dict[str, str] = {}  # user_id: voice

    async def connect(self, websocket: WebSocket, session_key: str, selected_voice: str = "Aoede"):
        await websocket.accept()
        audio_loop = AudioLoop(video_mode="none", selected_voice=selected_voice)
        self.active_connections[session_key] = websocket
        self.audio_loops[session_key] = audio_loop
        await audio_loop.start_session()

    def disconnect(self, session_key: str):
        if session_key in self.active_connections:
            del self.active_connections[session_key]
        if session_key in self.audio_loops:
            del self.audio_loops[session_key]

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
    if not accessToken:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 세션 키는 websocket 객체의 id로 생성
    session_key = f"{id(websocket)}"
    await manager.connect(websocket, session_key, selected_voice=voice)
    try:
        while True:
            data = await websocket.receive_bytes()
            if session_key in manager.audio_loops:
                audio_loop = manager.audio_loops[session_key]
                await audio_loop.out_queue.put({"data": data, "mime_type": "audio/pcm"})
                if not audio_loop.audio_in_queue.empty():
                    response_data = await audio_loop.audio_in_queue.get()
                    await manager.send_audio(session_key, response_data)
    except WebSocketDisconnect:
        manager.disconnect(session_key)
        print(f"클라이언트 {session_key} 연결 종료")

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
