import {GoogleGenAI, Modality} from '@google/genai/web';

import {INSTRUCTION} from '../constants/aiCall';
import {useAiCallSettingsStore} from '../store/aiCallSettingsStore';

export interface LiveSessionConfig {
  model?: string;
  responseModalities?: Modality[];
  systemInstruction?: string;
}

export interface LiveSessionCallbacks {
  onopen?: () => void;
  onmessage?: (message: any) => void;
  onerror?: (error: Error) => void;
  onclose?: (reason: string) => void;
}

export interface AudioData {
  data: string; // base64 encoded
  mimeType: string;
}

export class GeminiLiveSessionManager {
  private session: any = null;
  private responseQueue: any[] = [];
  private ai: GoogleGenAI | null = null;

  constructor() {}

  /**
   * ephemeral token으로 session 초기화
   */
  async initializeWithToken(
    ephemeralToken: string,
    config: LiveSessionConfig = {},
    callbacks: LiveSessionCallbacks = {},
  ): Promise<void> {
    try {
      // GoogleGenAI 인스턴스 생성
      this.ai = new GoogleGenAI({apiKey: ephemeralToken});

      const defaultConfig = {
        model: config.model || 'gemini-2.0-flash-live-001',
        responseModalities: config.responseModalities || [
          Modality.AUDIO,
          Modality.TEXT,
        ],
        systemInstruction: config.systemInstruction || INSTRUCTION,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: useAiCallSettingsStore.getState().voice,
            },
          },
          languageCode: 'ko-KR',
        },
      };

      const defaultCallbacks = {
        onopen: () => {
          console.log('Gemini Live Session opened');
          callbacks.onopen?.();
        },
        onmessage: (message: any) => {
          console.log('Gemini Live Session message:', message);
          this.responseQueue.push(message);
          callbacks.onmessage?.(message);
        },
        onerror: (error: Error) => {
          console.error('Gemini Live Session error:', error);
          callbacks.onerror?.(error);
        },
        onclose: (reason: string) => {
          console.log('Gemini Live Session closed:', reason);
          callbacks.onclose?.(reason);
        },
      };

      // Live session 연결
      this.session = await this.ai.live.connect({
        model: defaultConfig.model,
        config: defaultConfig,
        callbacks: defaultCallbacks,
      });

      console.log('Gemini Live Session connected successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini Live Session:', error);
      throw error;
    }
  }

  /**
   * 오디오 데이터 전송
   */
  async sendAudio(audioData: AudioData): Promise<void> {
    if (!this.session) {
      throw new Error(
        'Session not initialized. Call initializeWithToken first.',
      );
    }

    try {
      await this.session.sendRealtimeInput({
        audio: audioData,
      });
    } catch (error) {
      console.error('Failed to send audio:', error);
      throw error;
    }
  }

  /**
   * 텍스트 메시지 전송
   */
  async sendText(text: string): Promise<void> {
    if (!this.session) {
      throw new Error(
        'Session not initialized. Call initializeWithToken first.',
      );
    }

    try {
      await this.session.sendRealtimeInput({
        text: text,
      });
    } catch (error) {
      console.error('Failed to send text:', error);
      throw error;
    }
  }

  /**
   * 응답 메시지 대기
   */
  private async waitMessage(): Promise<any> {
    let done = false;
    let message: any;

    while (!done) {
      message = this.responseQueue.shift();
      if (message) {
        done = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return message;
  }

  /**
   * 턴 완료까지 메시지들 수집
   */
  async handleTurn(): Promise<any[]> {
    const turns: any[] = [];
    let done = false;

    while (!done) {
      const message = await this.waitMessage();
      turns.push(message);

      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }

    return turns;
  }

  /**
   * 응답 큐 비우기
   */
  clearResponseQueue(): void {
    this.responseQueue = [];
  }

  /**
   * 세션 종료
   */
  closeSession(): void {
    if (this.session) {
      this.session.close();
      this.session = null;
      this.responseQueue = [];
      console.log('Gemini Live Session closed');
    }
  }

  /**
   * 세션 상태 확인
   */
  isSessionActive(): boolean {
    return this.session !== null;
  }
}

// 싱글톤 인스턴스
export const geminiLiveSession = new GeminiLiveSessionManager();

interface ConnectAndNavigateProps {
  ephemeralToken: string;
  navigation: any; // React Navigation의 navigation prop
  config?: LiveSessionConfig;
  callbacks?: LiveSessionCallbacks;
}

// React Native에서 사용할 수 있는 헬퍼 함수들
export const GeminiLiveUtils = {
  /**
   * 수락 버튼 클릭 시 세션 연결 및 화면 이동
   */
  async connectAndNavigate({
    ephemeralToken,
    navigation,
    config,
    callbacks,
  }: ConnectAndNavigateProps): Promise<void> {
    try {
      // 세션 연결
      await geminiLiveSession.initializeWithToken(ephemeralToken, config, {
        ...callbacks,
        onopen: () => {
          console.log('Session connected, navigating to CallActive');
          callbacks?.onopen?.();
          // CallActive 화면으로 이동
          navigation.navigate('CallActive');
        },
      });
    } catch (error) {
      console.error('Failed to connect session and navigate:', error);
      throw error;
    }
  },

  /**
   * PCM 오디오를 base64로 변환 (React Native용)
   */
  convertPCMToBase64(pcmData: ArrayBuffer): string {
    const uint8Array = new Uint8Array(pcmData);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  },

  /**
   * base64 오디오를 PCM으로 변환
   */
  convertBase64ToPCM(base64Audio: string): ArrayBuffer {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
};

export {Modality};
