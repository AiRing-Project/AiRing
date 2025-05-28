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
        self.RATE = 24000  # 24kHz로 변경
        self.CHUNK = 2048
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.stream = None
        self.output_stream = None
        self.running = False
        self.noise_gate = 0.01  # 노이즈 게이트 임계값
        self.normalization_factor = 1.5  # 오디오 정규화 계수
        self._shutdown_event = asyncio.Event()
        self._audio_buffer = asyncio.Queue(maxsize=32)  # 오디오 버퍼 추가

    def setup_audio_streams(self):
        """오디오 스트림을 설정합니다."""
        try:
            # 입력 스트림 설정
            self.stream = self.p.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                input=True,
                frames_per_buffer=self.CHUNK
            )
            
            # 출력 스트림 설정 - 기본 설정으로 단순화
            self.output_stream = self.p.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                output=True,
                frames_per_buffer=512  # 버퍼 크기 줄임
            )
            
            print("[클라이언트] 오디오 스트림 설정 완료")
            
            # 테스트용 사운드 생성 및 재생
            test_sound = np.sin(np.linspace(0, 2*np.pi, self.RATE)).astype(np.float32)
            test_sound = (test_sound * 32767).astype(np.int16)
            print("[클라이언트] 테스트 사운드 재생 시도...")
            self.output_stream.write(test_sound.tobytes())
            print("[클라이언트] 테스트 사운드 재생 완료")
            
        except Exception as e:
            print(f"[클라이언트] 오디오 스트림 설정 중 오류: {str(e)}")
            if self.stream is not None:
                self.stream.stop_stream()
                self.stream.close()
                self.stream = None
            if self.output_stream is not None:
                self.output_stream.stop_stream()
                self.output_stream.close()
                self.output_stream = None
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
            print("[클라이언트] 초기화 완료")
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
                        print("[클라이언트] 오디오 데이터 전송됨")  # 전송 로그 추가
                    except websockets.exceptions.ConnectionClosed:
                        print("[클라이언트] WebSocket 연결이 종료되었습니다")
                        break
                    except Exception as e:
                        print(f"[클라이언트] 데이터 전송 중 오류: {str(e)}")
                        await asyncio.sleep(0.1)
                        continue
            except Exception as e:
                print(f"[클라이언트] 오디오 전송 중 오류: {str(e)}")
                await asyncio.sleep(0.1)

    async def receive_audio(self):
        """서버로부터 오디오 데이터를 수신합니다."""
        print("[클라이언트] 오디오 수신 시작")
        while self.running:
            try:
                if not self.websocket:
                    print("[클라이언트] WebSocket 연결이 없습니다")
                    break

                try:
                    print("[클라이언트] 오디오 데이터 수신 대기 중...")
                    response = await self.websocket.recv()
                    print(f"[클라이언트] 데이터 수신됨: {type(response)}, 크기: {len(response) if isinstance(response, bytes) else 'N/A'}")
                    
                    if isinstance(response, bytes):
                        try:
                            print(f"[클라이언트] 오디오 데이터 수신 시각: {time.time():.2f}, 크기: {len(response)} bytes")
                            audio_data = np.frombuffer(response, dtype=np.int16)
                            print(f"[클라이언트] 오디오 데이터 최대값: {np.abs(audio_data).max()}")
                            print(f"[클라이언트] 오디오 데이터 재생 시각: {time.time():.2f}, 크기: {len(audio_data)} bytes")
                            self.output_stream.write(response)
                            self.output_stream.stop_stream()
                            self.output_stream.start_stream()
                            print("[클라이언트] 오디오 데이터 재생 완료")
                            self.last_user_input_time = time.time()  # 사용자 입력 타임스탬프 갱신
                        except Exception as e:
                            print(f"[클라이언트] 오디오 재생 중 오류: {str(e)}")
                            try:
                                print("[클라이언트] 출력 스트림 재시작 시도")
                                self.output_stream.stop_stream()
                                self.output_stream.start_stream()
                                print("[클라이언트] 출력 스트림 재시작 완료")
                            except Exception as restart_error:
                                print(f"[클라이언트] 스트림 재시작 중 오류: {str(restart_error)}")
                                await asyncio.sleep(0.1)
                                continue
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

    async def play_audio(self):
        """버퍼에서 오디오 데이터를 재생합니다."""
        while self.running:
            try:
                # 버퍼에서 오디오 데이터 가져오기
                audio_data = await self._audio_buffer.get()
                try:
                    # 오디오 데이터 재생
                    print(f"[클라이언트] 오디오 데이터 재생 시각: {time.time():.2f}, 크기: {len(audio_data)} bytes")
                    self.output_stream.write(audio_data)
                    print(f"[클라이언트] 오디오 데이터 재생: {len(audio_data)} bytes")
                except Exception as e:
                    print(f"[클라이언트] 오디오 재생 중 오류: {str(e)}")
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[클라이언트] 오디오 재생 중 오류: {str(e)}")
                await asyncio.sleep(0.1)

    async def stop(self):
        """클라이언트를 안전하게 종료합니다."""
        print("[클라이언트] 종료 시작...")
        self.running = False
        self._shutdown_event.set()
        
        if self.websocket:
            try:
                await self.websocket.close()
            except Exception as e:
                print(f"[클라이언트] WebSocket 종료 중 오류: {str(e)}")
        
        if self.stream:
            try:
                self.stream.stop_stream()
                self.stream.close()
            except Exception as e:
                print(f"[클라이언트] 입력 스트림 종료 중 오류: {str(e)}")
        
        if self.output_stream:
            try:
                self.output_stream.stop_stream()
                self.output_stream.start_stream()
                self.output_stream.stop_stream()
                self.output_stream.close()
            except Exception as e:
                print(f"[클라이언트] 출력 스트림 종료 중 오류: {str(e)}")
        
        try:
            self.p.terminate()
        except Exception as e:
            print(f"[클라이언트] PyAudio 종료 중 오류: {str(e)}")
        
        print("[클라이언트] 종료 완료")

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
    tasks = []
    
    try:
        print("[클라이언트] 연결 시작")
        await client.connect()
        print("[클라이언트] 태스크 시작")
        tasks.append(asyncio.create_task(client.send_audio()))
        tasks.append(asyncio.create_task(client.receive_audio()))
        
        print("[클라이언트] 메인 루프 시작")
        # 종료 이벤트 대기
        while not client._shutdown_event.is_set():
            await asyncio.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n프로그램을 종료합니다...")
    except Exception as e:
        print(f"오류 발생: {str(e)}")
    finally:
        print("[클라이언트] 종료 처리 시작")
        # 모든 태스크 취소
        for task in tasks:
            if not task.done():
                task.cancel()
        
        # 태스크가 완료될 때까지 대기
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        
        # 클라이언트 종료
        await client.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n프로그램이 종료되었습니다.") 