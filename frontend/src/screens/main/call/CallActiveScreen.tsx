import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
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

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleSpeakerPress = () => {
    setSpeakerOn(prev => !prev);
    // TODO: 스피커 온/오프 동작 추가
  };

  const handleHangUpPress = () => {
    navigation.navigate('Home');
  };

  const handleMicPress = () => {
    setMicMuted(prev => !prev);
    // TODO: 마이크 온/오프 동작 추가
  };

  return (
    <AppScreen style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>AIRING</Text>
        {/* TODO: 실제 데이터로 교체 */}
        <Text style={styles.reservation}>{formatDuration(elapsed)}</Text>
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
