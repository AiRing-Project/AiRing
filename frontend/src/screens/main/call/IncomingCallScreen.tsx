import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {RootStackParamList} from '../../../../App';
import IcCallAnswer from '../../../assets/icons/ic-call-answer.svg';
import IcCallDecline from '../../../assets/icons/ic-call-decline.svg';
import EmojiBox from '../../../components/common/EmojiBox';
import AppScreen from '../../../components/layout/AppScreen';
import {CALLBACK_LIST} from '../../../constants/aiCall';
import {ACCEPT_COLOR, DECLINE_COLOR} from '../../../constants/colors';
import {useAiCallSettingsStore} from '../../../store/aiCallSettingsStore';
import {initAiCall} from '../../../utils/aiCall';
import {scheduleAlarm} from '../../../utils/alarmManager';
import {
  GeminiLiveUtils,
  LiveSessionCallbacks,
} from '../../../utils/geminiLiveSession';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const BUTTON_SIZE = 70;
const BUTTON_CONTAINER_PADDING = 14;
const CONTAINER_HORIZONTAL_PADDING = 40;
const BUTTON_CONTAINER_WIDTH = SCREEN_WIDTH - 2 * CONTAINER_HORIZONTAL_PADDING;
const SLIDE_RANGE =
  BUTTON_CONTAINER_WIDTH / 2 - BUTTON_SIZE / 2 - BUTTON_CONTAINER_PADDING;
const THRESHOLD = SLIDE_RANGE * 0.5;

const IncomingCallScreen = () => {
  const [response, setResponse] = useState<'decline' | 'accept' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;
  const boxOpacity = pan.interpolate({
    inputRange: [-SLIDE_RANGE, 0, SLIDE_RANGE],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {callBack} = useAiCallSettingsStore.getState();

  const handleCallBack = async (callBackTime: string) => {
    const minutes = CALLBACK_LIST.find(c => c.label === callBackTime)!.value;
    const date = new Date(Date.now() + minutes * 60_000);
    await scheduleAlarm(`callback-${Date.now()}`, date, false);
    navigation.navigate('Home');
  };

  const handleDecline = async () => {
    setResponse('decline');
    navigation.navigate('Home');
  };

  // AI 세션 콜백 핸들러들
  const handleSessionOpen = () => {
    setIsConnecting(false);
  };

  const handleSessionMessage = (message: any) => {
    // TODO: 메시지 처리 로직 추가 (오디오 재생 등)
    console.log('📞 AI 대화 메시지:', message);
  };

  const handleSessionError = () => {
    setIsConnecting(false);
    setResponse(null);
    Alert.alert(
      '연결 오류',
      'AI와의 대화 연결에 실패했습니다. 다시 시도해주세요.',
    );
  };

  const handleSessionClose = (reason: string) => {
    console.log('📞 AI 대화 종료:', reason);
    setIsConnecting(false);
  };

  // AI 세션 초기화
  const initializeAiSession = async (ephemeralToken: string) => {
    const callbacks: LiveSessionCallbacks = {
      onopen: handleSessionOpen,
      onmessage: handleSessionMessage,
      onerror: handleSessionError,
      onclose: handleSessionClose,
    };

    await GeminiLiveUtils.connectAndNavigate({
      ephemeralToken,
      navigation,
      callbacks,
    });
    console.log('AI 대화 세션 초기화 완료');
  };

  // 통화 초기화 성공 핸들러
  const handleCallInitSuccess = async (
    ephemeralToken: string,
    _callLogId: number,
  ) => {
    try {
      await initializeAiSession(ephemeralToken);
    } catch (sessionError) {
      console.error('AI 세션 초기화 실패:', sessionError);
      setIsConnecting(false);
      setResponse(null);
      Alert.alert(
        'AI 연결 실패',
        'AI와의 대화를 시작할 수 없습니다. 네트워크를 확인하고 다시 시도해주세요.',
      );
    }
  };

  // 통화 초기화 실패 핸들러
  const handleCallInitError = (error: unknown) => {
    console.error('initAiCall 실패:', error);
    setIsConnecting(false);
    setResponse(null);
    Animated.timing(pan, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  };

  const handleAccept = async () => {
    setResponse('accept');
    setIsConnecting(true);

    await initAiCall({
      callType: 'incoming',
      onSuccess: handleCallInitSuccess,
      onError: handleCallInitError,
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isConnecting, // 연결 중일 때는 제스처 비활성화
      onPanResponderMove: (_, gesture) => {
        if (isConnecting) {
          return;
        } // 연결 중일 때는 동작하지 않음
        const clampedDx = Math.max(
          -SLIDE_RANGE,
          Math.min(SLIDE_RANGE, gesture.dx),
        );
        pan.setValue(clampedDx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isConnecting) {
          return;
        } // 연결 중일 때는 동작하지 않음

        if (gesture.dx < -THRESHOLD) {
          Animated.timing(pan, {
            toValue: -SLIDE_RANGE,
            duration: 220,
            useNativeDriver: false,
          }).start(handleDecline);
        } else if (gesture.dx > THRESHOLD) {
          Animated.timing(pan, {
            toValue: SLIDE_RANGE,
            duration: 220,
            useNativeDriver: false,
          }).start(handleAccept);
        } else {
          setResponse(null);
          Animated.timing(pan, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <AppScreen style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>AIRING</Text>
        <Text style={styles.subText}>
          {isConnecting ? 'AI와 연결하는 중...' : '예약된 전화가 왔어요!'}
        </Text>
      </View>
      <View style={styles.interactionContainer}>
        {callBack.enabled && !isConnecting && (
          <TouchableOpacity
            style={styles.callBackButton}
            onPress={() => handleCallBack(callBack.value)}>
            <Text style={styles.subText}>{callBack.value} 다시 전화</Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttonContainer}>
          <View
            style={[
              styles.callDeclineButton,
              response === 'decline' && {
                boxShadow: `0 0 12px 0 ${DECLINE_COLOR}`,
              },
            ]}>
            <IcCallDecline />
          </View>
          <Animated.View
            style={{transform: [{translateX: pan}]}}
            {...panResponder.panHandlers}>
            <Animated.View style={{opacity: boxOpacity}}>
              <EmojiBox
                size={BUTTON_SIZE}
                backgroundColor="#fff"
                eyesColor="#000"
                showEyes={true}
                style={styles.emojiBox}
              />
            </Animated.View>
          </Animated.View>
          <View
            style={[
              styles.callAnswerButton,
              response === 'accept' && {
                boxShadow: `0 0 12px 0 ${ACCEPT_COLOR}`,
              },
            ]}>
            <IcCallAnswer />
          </View>
        </View>
      </View>
      {(response === 'accept' || isConnecting) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={80} color="#fff" />
        </View>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#010201',
    paddingHorizontal: CONTAINER_HORIZONTAL_PADDING,
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
  subText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A7A7A7',
  },
  callBackButton: {
    backgroundColor: '#232323',
    borderRadius: 99,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  interactionContainer: {
    marginTop: 'auto',
    marginBottom: SCREEN_HEIGHT * 0.1,
    gap: 20,
  },
  buttonContainer: {
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    height: 94,
    paddingHorizontal: BUTTON_CONTAINER_PADDING,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callDeclineButton: {
    backgroundColor: DECLINE_COLOR,
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callAnswerButton: {
    backgroundColor: ACCEPT_COLOR,
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBox: {boxShadow: '0 0 12px 0 #fff'},
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
});

export default IncomingCallScreen;
