import {WEBSOCKET_URL} from '@env';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
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
const MAX_RECONNECT = 3;

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

  const isRecordingRef = useRef(false);
  const isCleanupRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const {connect, startRecording, stopRecording, disconnect} = useAiCall({
    onMessage: message => {
      if (isCleanupRef.current) {
        return;
      }
      if (message.text) {
        console.log('AI 응답:', message.text);
      }
      if (message.audio) {
        console.log('오디오 재생 시작');
      }
    },
    onConnectionStateChange: async state => {
      if (isCleanupRef.current) {
        return;
      }
      setIsConnected(state.connected);
      setIsConnecting(false);
      if (state.connected) {
        if (!micMuted && !isRecordingRef.current) {
          try {
            await startRecording();
            isRecordingRef.current = true;
          } catch (e) {
            setError('녹음을 시작할 수 없습니다.');
          }
        }
        reconnectAttempts.current = 0;
      } else {
        isRecordingRef.current = false;
        if (reconnectAttempts.current < MAX_RECONNECT) {
          reconnectAttempts.current += 1;
          setTimeout(() => connect(WEBSOCKET_URL), 1000);
        } else {
          setError(
            '서버와의 연결이 반복적으로 끊어집니다. 잠시 후 다시 시도해 주세요.',
          );
        }
      }
    },
    onError: error => {
      if (isCleanupRef.current) {
        return;
      }
      setError(error.error || '알 수 없는 에러');
    },
  });

  useEffect(() => {
    isCleanupRef.current = false;
    setIsConnecting(true);
    connect(WEBSOCKET_URL);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      isCleanupRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (isRecordingRef.current) {
        stopRecording();
        isRecordingRef.current = false;
      }
      disconnect();
    };
  }, [startTime, connect, stopRecording, disconnect]);

  const handleSpeakerPress = () => {
    setSpeakerOn(prev => !prev);
    // TODO: 스피커 온/오프 동작 추가
  };

  const handleHangUpPress = async () => {
    try {
      if (isRecordingRef.current) {
        await stopRecording();
        isRecordingRef.current = false;
      }
      await disconnect();
      navigation.navigate('Home');
    } catch (error) {
      console.error('통화 종료 실패:', error);
      navigation.navigate('Home');
    }
  };

  const handleMicPress = async () => {
    try {
      const newMicMuted = !micMuted;
      setMicMuted(newMicMuted);
      if (newMicMuted && isRecordingRef.current) {
        await stopRecording();
        isRecordingRef.current = false;
      } else if (!newMicMuted && isConnected && !isRecordingRef.current) {
        await startRecording();
        isRecordingRef.current = true;
      }
    } catch (error) {
      setError('마이크 상태를 변경할 수 없습니다.');
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
