import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useRef, useState} from 'react';
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

type PasswordBoxStatus = 'inactive' | 'inputting' | 'success' | 'error';

interface PasswordBoxProps {
  status: PasswordBoxStatus;
}

const PASSWORD_BOX_STYLE = {
  inactive: {color: '#f4f4f4', showEyes: false},
  inputting: {color: '#191919', showEyes: true},
  success: {color: '#48C06D', showEyes: true},
  error: {color: '#F36A89', showEyes: true},
};

const PASSWORD_LENGTH = 4;

const PasswordBox = ({status}: PasswordBoxProps) => {
  const {color, showEyes} = PASSWORD_BOX_STYLE[status];

  return (
    <View
      style={[
        styles.inputBox,
        styles.inputBoxContent,
        {backgroundColor: color, borderColor: color},
      ]}>
      {showEyes && <EyesIcon />}
    </View>
  );
};

const AppLockScreen = () => {
  const [password, setPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const inputRef = useRef<TextInput | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'AppLock'>>();

  const correctPassword = '1234'; // 테스트용 비밀번호
  const username = '아이링'; // 테스트용 사용자명

  const getBoxStatus = useCallback(
    (idx: number, pw: string, error: boolean): PasswordBoxStatus => {
      if (pw.length === PASSWORD_LENGTH) {
        return error ? 'error' : 'success';
      }
      if (pw.length > idx) {
        return 'inputting';
      }
      return 'inactive';
    },
    [],
  );

  const inputBoxStatusList = useMemo(
    () =>
      Array.from({length: PASSWORD_LENGTH}).map((_, idx) =>
        getBoxStatus(idx, password, isError),
      ),
    [password, isError, getBoxStatus],
  );

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setIsError(false);
    if (text.length === PASSWORD_LENGTH) {
      if (text === correctPassword) {
        setTimeout(() => {
          setPassword('');
          setIsError(false);
          navigation.replace('Home');
        }, 500);
      } else {
        setIsError(true);
        setTimeout(() => {
          setIsError(false);
          setPassword('');
        }, 500);
      }
    }
  };

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
          {inputBoxStatusList.map((status, idx) => (
            <PasswordBox key={idx} status={status} />
          ))}
          {/* 실제 입력은 숨김 TextInput으로 처리 */}
          <TextInput
            ref={inputRef}
            value={password}
            onChangeText={handlePasswordChange}
            keyboardType="number-pad"
            maxLength={PASSWORD_LENGTH}
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
