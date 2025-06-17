import {useEffect} from 'react';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const {AiCallModule} = NativeModules;

interface AiCallMessage {
  text?: string;
  audio?: string;
}

interface ConnectionState {
  connected: boolean;
  reason?: string;
}

interface AiCallError {
  error: string;
}

interface UseAiCallProps {
  onMessage?: (message: AiCallMessage) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: AiCallError) => void;
}

interface AiCallModule {
  connect(url: string): Promise<void>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  disconnect(): Promise<void>;
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

export const useAiCall = ({
  onMessage,
  onConnectionStateChange,
  onError,
}: UseAiCallProps) => {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const eventEmitter = new NativeEventEmitter(AiCallModule);

    const messageSubscription = eventEmitter.addListener(
      'onMessage',
      (event: AiCallMessage) => {
        onMessage?.(event);
      },
    );

    const connectionSubscription = eventEmitter.addListener(
      'onConnectionStateChange',
      (state: ConnectionState) => {
        onConnectionStateChange?.(state);
      },
    );

    const errorSubscription = eventEmitter.addListener(
      'onError',
      (error: AiCallError) => {
        onError?.(error);
      },
    );

    return () => {
      messageSubscription.remove();
      connectionSubscription.remove();
      errorSubscription.remove();
      // Cleanup any ongoing operations
      disconnect().catch(error => {
        console.error('Cleanup disconnect error:', error);
      });
    };
  }, [onMessage, onConnectionStateChange, onError]);

  const connect = async (url: string) => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      await AiCallModule.connect(url);
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      await AiCallModule.startRecording();
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      await AiCallModule.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      await AiCallModule.disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  };

  return {
    connect,
    startRecording,
    stopRecording,
    disconnect,
  };
};
