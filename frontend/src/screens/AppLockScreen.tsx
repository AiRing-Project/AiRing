import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {RootStackParamList} from '../../App';
import BackspaceIcon from '../assets/icons/ic-backspace.svg';
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

interface PasswordInputAreaProps {
  password: string;
  error: boolean;
}

const PasswordInputArea = ({password, error}: PasswordInputAreaProps) => {
  const getBoxStatus = useCallback(
    (idx: number, pw: string, isError: boolean): PasswordBoxStatus => {
      if (pw.length === PASSWORD_LENGTH) {
        return isError ? 'error' : 'success';
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
        getBoxStatus(idx, password, error),
      ),
    [password, error, getBoxStatus],
  );

  return (
    <View style={styles.inputBoxWrap}>
      {inputBoxStatusList.map((status, idx) => (
        <PasswordBox key={idx} status={status} />
      ))}
    </View>
  );
};

// 커스텀 NumPad 컴포넌트 추가
interface NumPadProps {
  onPress: (num: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const NumPad = ({onPress, onBackspace, disabled}: NumPadProps) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '←'],
  ];
  return (
    <View style={styles.numpadWrap}>
      {numbers.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.numpadRow}>
          {row.map((item, colIdx) => {
            if (item === '') {
              return <View key={colIdx} style={styles.numpadButton} />;
            }
            if (item === '←') {
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={styles.numpadButton}
                  onPress={onBackspace}
                  disabled={disabled}>
                  <BackspaceIcon width={32} height={32} color={'#888'} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={colIdx}
                style={styles.numpadButton}
                onPress={() => onPress(item)}
                disabled={disabled}>
                <Text style={styles.numpadButtonText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const AppLockScreen = () => {
  const [password, setPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'AppLock'>>();

  const correctPassword = '1234'; // 테스트용 비밀번호
  const username = '아이링'; // 테스트용 사용자명

  // 숫자 버튼 클릭 시
  const handleNumPress = (num: string) => {
    if (password.length >= PASSWORD_LENGTH) {
      return;
    }
    const newPassword = password + num;
    setPassword(newPassword);
    setIsError(false);
    if (newPassword.length === PASSWORD_LENGTH) {
      if (newPassword === correctPassword) {
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

  // 지우기 버튼 클릭 시
  const handleBackspace = () => {
    if (password.length === 0) {
      return;
    }
    setPassword(password.slice(0, -1));
    setIsError(false);
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
        <PasswordInputArea password={password} error={isError} />
        {/* 커스텀 숫자 패드 */}
        <NumPad
          onPress={handleNumPress}
          onBackspace={handleBackspace}
          disabled={password.length === PASSWORD_LENGTH}
        />
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
  inputBoxContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadWrap: {
    marginTop: 'auto',
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadRow: {
    flexDirection: 'row',
    width: '100%',
  },
  numpadButton: {
    flex: 1,
    aspectRatio: 1.6,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadButtonText: {
    fontSize: 28,
    color: '#0a0a05',
    fontWeight: '500',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
});

export default AppLockScreen;
