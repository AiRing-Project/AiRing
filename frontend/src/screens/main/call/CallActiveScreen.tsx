import {WEBSOCKET_URL} from '@env';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {RootStackParamList} from '../../../../App';
import IcCallDecline from '../../../assets/icons/ic-call-decline.svg';
import IcMicOff from '../../../assets/icons/ic-mic-off.svg';
import IcSpeaker from '../../../assets/icons/ic-speaker.svg';
import AppScreen from '../../../components/layout/AppScreen';
import {useAiCall} from '../../../hooks/useAiCall';
import {formatDuration} from '../../../utils/date';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const BUTTON_SIZE = 60;

const CallActiveScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [speakerOn, setSpeakerOn] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout>();
  const isUnmountedRef = useRef(false);

  const {connect, startRecording, stopRecording, disconnect} = useAiCall({
    onMessage: useCallback((message: {text?: string; audio?: string}) => {
      if (isUnmountedRef.current) {
        return;
      }

      if (message.text) {
        console.log('AI 응답:', message.text);
      }
      if (message.audio) {
        console.log('오디오 재생 시작');
      }
    }, []),
    onConnectionStateChange: useCallback(
      async (state: {connected: boolean}) => {
        if (isUnmountedRef.current) {
          return;
        }

        console.log('연결 상태 변경:', state.connected);
        setIsConnected(state.connected);
        setIsConnecting(false);

        if (state.connected && !micMuted) {
          try {
            await startRecording();
          } catch (error) {
            console.error('녹음 시작 실패:', error);
            setError('녹음을 시작할 수 없습니다.');
          }
        }
      },
      [micMuted],
    ),
    onError: useCallback((error: {error: string}) => {
      if (isUnmountedRef.current) {
        return;
      }

      console.error('에러 발생:', error);
      setError(error.error);
      setIsConnecting(false);
    }, []),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    setIsConnecting(true);
    connect(WEBSOCKET_URL).catch(error => {
      console.error('웹소켓 연결 실패:', error);
      setError('연결할 수 없습니다.');
      setIsConnecting(false);
    });

    return () => {
      clearInterval(interval);
      disconnect().catch(error => {
        console.error('연결 해제 실패:', error);
      });
    };
  }, [startTime, connect, disconnect]);

  const handleSpeakerPress = () => {
    setSpeakerOn(prev => !prev);
    // TODO: 스피커 온/오프 동작 추가
  };

  const handleHangUpPress = async () => {
    try {
      if (isConnected && !micMuted) {
        await stopRecording();
      }
      await disconnect();
      navigation.navigate('Home');
    } catch (error) {
      console.error('통화 종료 실패:', error);
      navigation.navigate('Home'); // 에러가 발생해도 홈으로 이동
    }
  };

  const handleMicPress = async () => {
    try {
      const newMicMuted = !micMuted;
      setMicMuted(newMicMuted);

      if (newMicMuted) {
        await stopRecording();
      } else if (isConnected) {
        await startRecording();
      }
    } catch (error) {
      console.error('마이크 상태 변경 실패:', error);
      setError('마이크 상태를 변경할 수 없습니다.');
      // 에러 발생 시 상태 되돌리기
      setMicMuted(prev => !prev);
    }
  };

  const getConnectionStatus = () => {
    if (error) {
      return error;
    }
    if (isConnecting) {
      return '연결 중...';
    }
    if (isConnected) {
      return '연결됨';
    }
    return '연결 끊김';
  };

  return (
    <AppScreen style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>AIRING</Text>
        <Text style={styles.reservation}>{formatDuration(elapsed)}</Text>
        <Text
          style={[
            styles.connectionStatus,
            error && styles.errorStatus,
            isConnected && styles.connectedStatus,
          ]}>
          {getConnectionStatus()}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.sideButton, speakerOn && styles.sideButtonActive]}
          onPress={handleSpeakerPress}>
          <IcSpeaker />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hangUpButton}
          onPress={handleHangUpPress}>
          <IcCallDecline width={40} height={40} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideButton, micMuted && styles.sideButtonActive]}
          onPress={handleMicPress}>
          <IcMicOff />
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#010201',
    paddingHorizontal: 70,
  },
  textContainer: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    marginTop: SCREEN_HEIGHT * 0.2,
    fontSize: 54,
    fontWeight: '700',
    color: '#fff',
  },
  reservation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  connectionStatus: {
    fontSize: 14,
    color: '#757575',
  },
  errorStatus: {
    color: '#F53E40',
  },
  connectedStatus: {
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: SCREEN_HEIGHT * 0.1,
  },
  hangUpButton: {
    backgroundColor: '#F53E40',
    height: BUTTON_SIZE + 10,
    width: BUTTON_SIZE + 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton: {
    backgroundColor: '#E5E5E5',
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonActive: {
    backgroundColor: '#696A69',
  },
});

export default CallActiveScreen;
