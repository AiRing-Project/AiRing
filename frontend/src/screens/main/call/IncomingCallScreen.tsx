import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
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

  const handleAccept = async () => {
    setResponse('accept');
    await initAiCall({
      callType: 'incoming',
      onSuccess: () => {
        navigation.navigate('CallActive');
      },
      onError: () => {
        setResponse(null);
        Animated.timing(pan, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
      },
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const clampedDx = Math.max(
          -SLIDE_RANGE,
          Math.min(SLIDE_RANGE, gesture.dx),
        );
        pan.setValue(clampedDx);
      },
      onPanResponderRelease: (_, gesture) => {
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
        <Text style={styles.subText}>예약된 전화가 왔어요!</Text>
      </View>
      <View style={styles.interactionContainer}>
        {callBack.enabled && (
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
      {response === 'accept' && (
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
});

export default IncomingCallScreen;
