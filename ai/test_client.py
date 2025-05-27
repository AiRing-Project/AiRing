import asyncio
import websockets
import pyaudio
import numpy as np
import json
import os
from dotenv import load_dotenv
import jwt
import time

# 환경 변수 로드
load_dotenv()

# JWT 토큰 생성 함수
def create_token(user_id: str) -> str:
    """테스트용 JWT 토큰을 생성합니다."""
    try:
        secret_key = os.environ["JWT_SECRET_KEY"]
        print("[클라이언트] JWT_SECRET_KEY를 사용하여 토큰 생성")
        payload = {
            "user_id": user_id,
            "exp": int(time.time()) + 3600  # 1시간 후 만료
        }
        token = f"Bearer {jwt.encode(payload, secret_key, algorithm='HS256')}"
        print(f"[클라이언트] 생성된 토큰: {token}")
        return token
    except KeyError:
        print("[클라이언트] JWT_SECRET_KEY가 설정되지 않았습니다. 테스트용 토큰을 사용합니다.")
        return "Bearer test_token"  # 테스트용 토큰

class AudioClient:
    def __init__(self, uri="ws://localhost:8000/ws/audio", voice="Aoede"):
        self.token = create_token('test_user')
        # URL 인코딩된 토큰 사용
        encoded_token = self.token.replace(" ", "%20")
        self.uri = f"{uri}?voice={voice}&accessToken={encoded_token}"
        print(f"[클라이언트] 초기화: URI={self.uri}")
        self.websocket = None
        self.p = pyaudio.PyAudio()
        self.RATE = 16000
        self.CHUNK = 2048
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.stream = None
        self.output_stream = None
        self.running = False
        self.noise_gate = 0.01  # 노이즈 게이트 임계값
        self.normalization_factor = 1.5  # 오디오 정규화 계수

    def setup_audio_streams(self):
        """오디오 스트림을 설정합니다."""
        try:
            self.stream = self.p.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                input=True,
                frames_per_buffer=self.CHUNK
            )
            self.output_stream = self.p.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                output=True,
                frames_per_buffer=self.CHUNK
            )
            print("[클라이언트] 오디오 스트림 설정 완료")
        except Exception as e:
            print(f"[클라이언트] 오디오 스트림 설정 중 오류: {str(e)}")
            # 이미 열려 있는 스트림이 있다면 안전하게 닫습니다.
            if self.stream is not None:
                self.stream.stop_stream()
                self.stream.close()
                self.stream = None
            if self.output_stream is not None:
                self.output_stream.stop_stream()
                self.output_stream.close()
                self.output_stream = None
            # PyAudio 인스턴스도 해제
            self.p.terminate()
            raise

    def process_audio_input(self, data):
        """오디오 입력을 처리합니다."""
        try:
            # numpy 배열로 변환
            audio_data = np.frombuffer(data, dtype=np.int16)
            
            # 노이즈 게이트 적용
            if np.abs(audio_data).mean() < self.noise_gate * 32767:
                return None
            
            # 정규화
            max_val = np.abs(audio_data).max()
            if max_val > 0:
                audio_data = audio_data * (32767 / max_val) * self.normalization_factor
                audio_data = np.clip(audio_data, -32767, 32767)
            
            return audio_data.astype(np.int16).tobytes()
        except Exception as e:
            print(f"[클라이언트] 오디오 처리 중 오류: {str(e)}")
            return None

    async def connect(self):
        """WebSocket 서버에 연결합니다."""
        try:
            print(f"[클라이언트] 서버 연결 시도: {self.uri}")
            # WebSocket 연결 설정
            self.websocket = await websockets.connect(
                self.uri,
                ping_interval=20,  # 20초마다 ping
                ping_timeout=30,   # ping 타임아웃 30초
                close_timeout=10,  # 종료 타임아웃 10초
                max_size=None,     # 메시지 크기 제한 없음
                max_queue=None     # 큐 크기 제한 없음
            )
            print("[클라이언트] 서버 연결 성공")
            self.running = True
            self.setup_audio_streams()
        except websockets.exceptions.InvalidStatusCode as e:
            print(f"[클라이언트] 서버 연결 실패 (상태 코드: {e.status_code}): {str(e)}")
            if self.websocket:
                await self.websocket.close()
            raise
        except Exception as e:
            print(f"[클라이언트] 서버 연결 실패: {str(e)}")
            if self.websocket:
                await self.websocket.close()
            raise

    async def send_audio(self):
        """오디오 데이터를 서버로 전송합니다."""
        while self.running:
            try:
                if not self.websocket:
                    print("[클라이언트] WebSocket 연결이 없습니다")
                    break

                data = self.stream.read(self.CHUNK, exception_on_overflow=False)
                processed_data = self.process_audio_input(data)
                
                if processed_data:
                    try:
                        await self.websocket.send(processed_data)
                        # print("[클라이언트] 오디오 데이터 전송됨")  # 로그 줄임
                    except websockets.exceptions.ConnectionClosed:
                        print("[클라이언트] WebSocket 연결이 종료되었습니다")
                        break
                    except Exception as e:
                        print(f"[클라이언트] 데이터 전송 중 오류: {str(e)}")
                        await asyncio.sleep(0.1)  # 에러 발생 시 잠시 대기
                        continue

            except Exception as e:
                print(f"[클라이언트] 오디오 전송 중 오류: {str(e)}")
                await asyncio.sleep(0.1)

    async def receive_audio(self):
        """서버로부터 오디오 데이터를 수신합니다."""
        while self.running:
            try:
                if not self.websocket:
                    print("[클라이언트] WebSocket 연결이 없습니다")
                    break

                try:
                    response = await self.websocket.recv()
                    if isinstance(response, bytes):
                        self.output_stream.write(response)
                except websockets.exceptions.ConnectionClosed:
                    print("[클라이언트] WebSocket 연결이 종료되었습니다")
                    break
                except Exception as e:
                    print(f"[클라이언트] 데이터 수신 중 오류: {str(e)}")
                    await asyncio.sleep(0.1)
                    continue

            except Exception as e:
                print(f"[클라이언트] 오디오 수신 중 오류: {str(e)}")
                await asyncio.sleep(0.1)

    async def stop(self):
        """클라이언트를 종료합니다."""
        self.running = False
        if self.websocket:
            await self.websocket.close()
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.output_stream:
            self.output_stream.stop_stream()
            self.output_stream.close()
        self.p.terminate()
        print("[클라이언트] 종료됨")

async def main():
    # 사용 가능한 음성 목록 출력
    print("\n=== 사용 가능한 AI 음성 ===")
    voices = {
        "1": "Aoede",
        "2": "Puck",
        "3": "Charon",
        "4": "Kore",
        "5": "Fenrir",
        "6": "Leda",
        "7": "Orus",
        "8": "Zephyr"
    }
    
    for key, voice in voices.items():
        print(f"{key}. {voice}")
    
    # 사용자 입력 받기
    while True:
        choice = input("\n사용할 AI 음성을 선택하세요 (1-8): ")
        if choice in voices:
            selected_voice = voices[choice]
            break
        print("잘못된 선택입니다. 다시 선택해주세요.")

    client = AudioClient(voice=selected_voice)
    try:
        await client.connect()
        send_task = asyncio.create_task(client.send_audio())
        receive_task = asyncio.create_task(client.receive_audio())
        
        # Ctrl+C를 누를 때까지 대기
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\n프로그램을 종료합니다...")
    except Exception as e:
        print(f"오류 발생: {str(e)}")
    finally:
        await client.stop()
        if 'send_task' in locals():
            send_task.cancel()
        if 'receive_task' in locals():
            receive_task.cancel()

if __name__ == "__main__":
    asyncio.run(main()) 