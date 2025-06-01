import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {RootStackParamList} from '../../App';
import EyesIcon from '../assets/icons/ic-emotion-eyes.svg';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AppLockScreen = () => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const inputRef = useRef<TextInput | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'AppLock'>>();

  const correctPassword = '1234'; // 테스트용 비밀번호

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(false);
    if (text.length === 4) {
      if (text === correctPassword) {
        setTimeout(() => {
          setPassword('');
          setError(false);
          navigation.replace('Home');
        }, 500);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPassword('');
        }, 500);
      }
    }
  };

  const username = '아이링'; // 테스트용 사용자명

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.titleWrap}>
          {/* 상단 안내문구 */}
          <Text style={styles.title}>비밀번호를 입력해주세요</Text>
          <Text style={styles.subtitle}>
            이 일기는 {username}님만 볼 수 있어요!
          </Text>
        </View>

        {/* 비밀번호 네모 입력칸 */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.inputBoxWrap}>
          {[0, 1, 2, 3].map(idx => {
            let boxStyle = styles.inputBoxInactive;
            let showEyes = false;
            if (password.length === 4) {
              if (error) {
                boxStyle = styles.inputBoxError;
                showEyes = true;
              } else {
                boxStyle = styles.inputBoxSuccess;
                showEyes = true;
              }
            } else if (password.length > idx) {
              boxStyle = styles.inputBoxInputting;
              showEyes = true;
            }
            return (
              <View
                key={idx}
                style={[styles.inputBox, boxStyle, styles.inputBoxContent]}>
                {showEyes && <EyesIcon />}
              </View>
            );
          })}
          {/* 실제 입력은 숨김 TextInput으로 처리 */}
          <TextInput
            ref={inputRef}
            value={password}
            onChangeText={handlePasswordChange}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.hiddenInput}
            autoFocus
            secureTextEntry
            caretHidden
          />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  titleWrap: {
    width: '100%',
    gap: 20,
    marginTop: SCREEN_HEIGHT * 0.188,
    marginBottom: 43,
  },
  title: {
    fontSize: 24,
    letterSpacing: 0.5,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#0a0a05',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 0.3,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
  inputBoxWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    width: '100%',
    height: 70,
  },
  inputBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1.5,
    marginHorizontal: 0,
  },
  inputBoxInactive: {
    backgroundColor: '#f4f4f4',
    borderColor: '#f4f4f4',
  },
  inputBoxInputting: {
    backgroundColor: '#191919',
    borderColor: '#191919',
  },
  inputBoxSuccess: {
    backgroundColor: '#48C06D',
    borderColor: '#48C06D',
  },
  inputBoxError: {
    backgroundColor: '#F36A89',
    borderColor: '#F36A89',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  inputBoxContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppLockScreen;
