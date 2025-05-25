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

import pyaudio
import json
from google import genai
from google.genai import types

from dotenv import load_dotenv

import websockets

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

def select_voice():
    print("\n=== AI 음성 선택 ===")
    print("사용 가능한 음성 목록:")
    for key, voice in AI_VOICES.items():
        print(f"{key}. {voice}")
    
    while True:
        choice = input("\n원하는 음성 번호를 선택하세요 (1-8): ")
        if choice in AI_VOICES:
            return AI_VOICES[choice]
        print("잘못된 선택입니다. 1-8 사이의 숫자를 입력해주세요.")

class AudioLoop:
    def __init__(self, video_mode=DEFAULT_MODE):
        self.video_mode = video_mode
        self.selected_voice = select_voice()  # 음성 선택 추가
        
        self.audio_in_queue = None
        self.out_queue = None

        self.session = None
        self._tasks = []  # 태스크 관리를 위한 리스트 추가

        self.receive_audio_task = None
        self.play_audio_task = None

        self.conversation_log = []
        self.ai_buffer = "" #AI 응답 누적 버퍼 추가
        self.user_buffer = "" #사용자 응답 누적 버퍼 추가

        self.last_user_input_time = time.time()
        self.session_active = True

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

    async def listen_audio(self):
        mic_info = pya.get_default_input_device_info()
        self.audio_stream = await asyncio.to_thread(
            pya.open,
            format=FORMAT,
            channels=CHANNELS,
            rate=SEND_SAMPLE_RATE,
            input=True,
            input_device_index=mic_info["index"],
            frames_per_buffer=CHUNK_SIZE,
        )
        if __debug__:
            kwargs = {"exception_on_overflow": False}
        else:
            kwargs = {}
        while self.session_active:
            data = await asyncio.to_thread(self.audio_stream.read, CHUNK_SIZE, **kwargs)
            await self.out_queue.put({"data": data, "mime_type": "audio/pcm"})

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

    async def play_audio(self):
        stream = await asyncio.to_thread(
            pya.open,
            format=FORMAT,
            channels=CHANNELS,
            rate=RECEIVE_SAMPLE_RATE,
            output=True,
        )
        
        # 오디오 버퍼 관리 - AI 대화 시작 시점 고려
        buffer = []
        initial_buffer_size = 5  # 초기 버퍼 크기 (AI 첫 응답을 위한 충분한 버퍼)
        minimum_buffer_size = 3  # 최소 버퍼 크기 (대화 중 끊김 방지)
        
        print("🔊 오디오 버퍼 준비 중...")
        
        # 초기 버퍼 채우기 - AI 첫 응답을 위한 준비
        while len(buffer) < initial_buffer_size:
            try:
                if not self.audio_in_queue.empty():
                    chunk = await asyncio.wait_for(self.audio_in_queue.get(), timeout=0.1)  # 첫 응답을 위한 여유 시간
                    buffer.append(chunk)
                else:
                    await asyncio.sleep(0.05)  # 대기 시간
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                return
        
        print("🔊 오디오 재생 시작")
        
        try:
            while self.session_active:
                # 버퍼가 최소 크기 이하로 떨어지면 더 채움
                if len(buffer) <= minimum_buffer_size:
                    refill_count = 0
                    while len(buffer) < initial_buffer_size and refill_count < 3:  # 안정적인 대화를 위한 충분한 리필
                        try:
                            if not self.audio_in_queue.empty():
                                chunk = await asyncio.wait_for(self.audio_in_queue.get(), timeout=0.08)  # 대화 중 적절한 대기 시간
                                buffer.append(chunk)
                                refill_count += 1
                            else:
                                break
                        except asyncio.TimeoutError:
                            break
                
                # 버퍼에서 청크 재생
                if buffer:
                    chunk = buffer.pop(0)
                    await asyncio.to_thread(stream.write, chunk)
                else:
                    # 버퍼가 비었으면 큐에서 직접 가져와 재생
                    try:
                        if not self.audio_in_queue.empty():
                            chunk = await asyncio.wait_for(self.audio_in_queue.get(), timeout=0.08)  # 대화 중 적절한 대기 시간
                            await asyncio.to_thread(stream.write, chunk)
                        else:
                            await asyncio.sleep(0.03)  # 대화 중 적절한 대기 시간
                    except asyncio.TimeoutError:
                        await asyncio.sleep(0.03)
        
        except asyncio.CancelledError:
            print("🔊 오디오 재생 중단")

    async def run(self):
        try:
            # 음성 설정 업데이트
            CONFIG = types.LiveConnectConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    language_code="ko-KR",  # 한국어 설정
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
                self.audio_in_queue = asyncio.Queue(maxsize=192)
                self.out_queue = asyncio.Queue(maxsize=5)

                await session.send_client_content(
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

                # 태스크 생성 및 실행
                tasks = []
                try:
                    # 각 태스크를 순차적으로 생성하고 실행
                    tasks.append(asyncio.create_task(self.send_realtime()))
                    tasks.append(asyncio.create_task(self.listen_audio()))
                    tasks.append(asyncio.create_task(self.receive_audio()))
                    tasks.append(asyncio.create_task(self.play_audio()))
                    tasks.append(asyncio.create_task(self.timeout_checker()))
                    self._tasks = tasks

                    # 메인 루프
                    while self.session_active:
                        await asyncio.sleep(0.5)
                    print("세션이 종료되었습니다.")

                finally:
                    # 세션 종료 처리
                    self.session_active = False
                    
                    # 태스크 정리 - 새로운 방식
                    for task in tasks:
                        if not task.done():
                            try:
                                # 태스크 취소 시도
                                task.cancel()
                            except Exception:
                                pass
                    
                    # 모든 태스크가 완료될 때까지 대기
                    pending = [t for t in tasks if not t.done()]
                    if pending:
                        try:
                            # 타임아웃을 0.1초로 줄여서 빠르게 종료
                            await asyncio.wait(pending, timeout=0.1)
                        except asyncio.TimeoutError:
                            pass

        except asyncio.CancelledError:
            pass
        except KeyboardInterrupt:
            # Ctrl+C로 종료될 때 대화 기록 저장
            with open("conversation_log.json", "w", encoding="utf-8") as f:
                json.dump(self.conversation_log, f, ensure_ascii=False, indent=2)
            print("대화 기록이 저장되었습니다.")
        except ExceptionGroup as EG:
            if hasattr(self, "audio_stream") and self.audio_stream is not None:
                self.audio_stream.close()
            # 예외 그룹의 각 예외를 개별적으로 처리
            for exc in EG.exceptions:
                if isinstance(exc, websockets.exceptions.ConnectionClosedOK):
                    continue
                print(f"오류 발생: {str(exc)}")
        except websockets.exceptions.ConnectionClosedOK:
            # 정상적인 종료 메시지는 출력하지 않음
            pass
        finally:
            # 최종 정리
            if hasattr(self, '_tasks'):
                self.session_active = False
                for task in self._tasks:
                    if not task.done():
                        try:
                            # 태스크 취소 시도
                            task.cancel()
                        except Exception:
                            pass
                
                # 남은 태스크 정리
                pending = [t for t in self._tasks if not t.done()]
                if pending:
                    try:
                        # 타임아웃을 0.1초로 줄여서 빠르게 종료
                        await asyncio.wait(pending, timeout=0.1)
                    except asyncio.TimeoutError:
                        pass
            
            # 대화 기록 저장
            with open("conversation_log.json", "w", encoding="utf-8") as f:
                json.dump(self.conversation_log, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main = AudioLoop(video_mode="none")
    asyncio.run(main.run())
