import React, {useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import IcCallAnswer from '../../../assets/icons/ic-call-answer.svg';
import IcCallDecline from '../../../assets/icons/ic-call-decline.svg';
import EmojiBox from '../../../components/common/EmojiBox';
import AppScreen from '../../../components/layout/AppScreen';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const BUTTON_SIZE = 70;
const BUTTON_CONTAINER_PADDING = 14;
const CONTAINER_HORIZONTAL_PADDING = 40;
const BUTTON_CONTAINER_WIDTH = SCREEN_WIDTH - 2 * CONTAINER_HORIZONTAL_PADDING;
const SLIDE_RANGE =
  BUTTON_CONTAINER_WIDTH / 2 - BUTTON_SIZE / 2 - BUTTON_CONTAINER_PADDING;
const THRESHOLD = SLIDE_RANGE * 0.5;

const CallScreen = () => {
  const pan = useRef(new Animated.Value(0)).current;
  const boxOpacity = pan.interpolate({
    inputRange: [-SLIDE_RANGE, 0, SLIDE_RANGE],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Clamp slide range
        const clampedDx = Math.max(
          -SLIDE_RANGE,
          Math.min(SLIDE_RANGE, gesture.dx),
        );
        pan.setValue(clampedDx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -THRESHOLD) {
          // Left (decline)
          Animated.timing(pan, {
            toValue: -SLIDE_RANGE,
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue(0);
            console.log('거절');
          });
        } else if (gesture.dx > THRESHOLD) {
          // Right (accept)
          Animated.timing(pan, {
            toValue: SLIDE_RANGE,
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue(0);
            console.log('수락');
          });
        } else {
          // Return to center slowly
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
        {/* TODO: 실제 데이터로 교체 */}
        <Text style={styles.reservation}>5월 7일 18:00 예약</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.callDeclineButton}>
          <IcCallDecline />
        </TouchableOpacity>
        <Animated.View
          style={[{transform: [{translateX: pan}]}]}
          {...panResponder.panHandlers}>
          <Animated.View style={{opacity: boxOpacity}}>
            <EmojiBox
              size={BUTTON_SIZE}
              backgroundColor="#fff"
              eyesColor="#000"
              showEyes={true}
              style={styles.callSlideButton}
            />
          </Animated.View>
        </Animated.View>
        <TouchableOpacity style={styles.callAnswerButton}>
          <IcCallAnswer />
        </TouchableOpacity>
      </View>
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
  reservation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A7A7A7',
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
    marginTop: 'auto',
    marginBottom: SCREEN_HEIGHT * 0.1,
  },
  callDeclineButton: {
    backgroundColor: '#f53e40',
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callSlideButton: {
    boxShadow: '0 0 12px 0 #fff',
  },
  callAnswerButton: {
    backgroundColor: '#00cc6b',
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CallScreen;
