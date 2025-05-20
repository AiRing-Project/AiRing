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
python Get_started_LiveAPI.py --mode none
```
"""

import asyncio
import os
import sys
import traceback

import pyaudio
import json
from google import genai
from google.genai import types

from dotenv import load_dotenv

load_dotenv(".env")

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

if sys.version_info < (3, 11, 0):
    import taskgroup, exceptiongroup

    asyncio.TaskGroup = taskgroup.TaskGroup
    asyncio.ExceptionGroup = exceptiongroup.ExceptionGroup

FORMAT = pyaudio.paInt16
CHANNELS = 1
SEND_SAMPLE_RATE = 16000
RECEIVE_SAMPLE_RATE = 24000
CHUNK_SIZE = 1024

MODEL = "models/gemini-2.0-flash-live-001"

DEFAULT_MODE = "none"


CONFIG = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    speech_config=types.SpeechConfig(language_code="ko-KR"),
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
    output_audio_transcription={},
)

pya = pyaudio.PyAudio()


class AudioLoop:
    def __init__(self, video_mode=DEFAULT_MODE):
        self.video_mode = video_mode

        self.audio_in_queue = None
        self.out_queue = None

        self.session = None

        self.receive_audio_task = None
        self.play_audio_task = None

        self.conversation_log = []
        self.ai_buffer = "" #AI 응답 누적 버퍼 추가
        self.user_buffer = "" #사용자 응답 누적 버퍼 추가

    async def send_realtime(self):
        while True:
            msg = await self.out_queue.get()
            blob = types.Blob(data=msg["data"], mime_type="audio/pcm;rate=16000")
            await self.session.send_realtime_input(audio=blob)

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
        while True:
            data = await asyncio.to_thread(self.audio_stream.read, CHUNK_SIZE, **kwargs)
            await self.out_queue.put({"data": data, "mime_type": "audio/pcm"})

    async def receive_audio(self):
        "Background task to reads from the websocket and write pcm chunks to the output queue"
        while True:
            turn = self.session.receive()
            async for response in turn:

                # 사용자 음성 텍스트 누적 (부분 응답)
                if (
                hasattr(response, "server_content")
                and hasattr(response.server_content, "input_transcription")
                and response.server_content.input_transcription
                and hasattr(response.server_content.input_transcription, "text")
                and response.server_content.input_transcription.text):
                    
                    user_text = response.server_content.input_transcription.text
                    self.user_buffer += user_text
        
                
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
                    self.audio_in_queue.put_nowait(data)
                    continue
                if text := response.text:
                    print(text, end="")

            while not self.audio_in_queue.empty():
                self.audio_in_queue.get_nowait()

    async def play_audio(self):
        stream = await asyncio.to_thread(
            pya.open,
            format=FORMAT,
            channels=CHANNELS,
            rate=RECEIVE_SAMPLE_RATE,
            output=True,
        )
        while True:
            bytestream = await self.audio_in_queue.get()
            await asyncio.to_thread(stream.write, bytestream)

    async def run(self):
        try:
            async with (
                client.aio.live.connect(model=MODEL, config=CONFIG) as session,
                asyncio.TaskGroup() as tg,
            ):
                self.session = session

                self.audio_in_queue = asyncio.Queue()
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


                tg.create_task(self.send_realtime())
                tg.create_task(self.listen_audio())

                tg.create_task(self.receive_audio())
                tg.create_task(self.play_audio())

                await asyncio.Event().wait()  # 무한 대기, Ctrl+c로 종료

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
            traceback.print_exception(EG)
        finally:
            with open("conversation_log.json", "w", encoding="utf-8") as f:
                json.dump(self.conversation_log, f, ensure_ascii=False, indent=2)    



if __name__ == "__main__":

    main = AudioLoop(video_mode="none")
    asyncio.run(main.run())
