import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import IcCallAnswer from '../../../assets/icons/ic-call-answer.svg';
import IcCallDecline from '../../../assets/icons/ic-call-decline.svg';
import EmojiBox from '../../../components/common/EmojiBox';
import AppScreen from '../../../components/layout/AppScreen';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const CallScreen = () => {
  return (
    <AppScreen style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>AIRING</Text>
        <Text style={styles.reservation}>5월 7일 18:00 예약</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.callDeclineButton}>
          <IcCallDecline />
        </TouchableOpacity>
        <EmojiBox
          size={70}
          backgroundColor="#fff"
          eyesColor="#000"
          showEyes={true}
          style={styles.callSlideButton}
        />
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
    paddingHorizontal: 55,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: SCREEN_HEIGHT * 0.1,
  },
  callDeclineButton: {
    backgroundColor: '#f53e40',
    height: 70,
    width: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callSlideButton: {
    boxShadow: '0 0 12px 0 #fff',
  },
  callAnswerButton: {
    backgroundColor: '#00cc6b',
    height: 70,
    width: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CallScreen;
