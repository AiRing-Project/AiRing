import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {RootStackParamList} from '../../../../App';
import BackspaceIcon from '../../../assets/icons/ic-backspace.svg';
import EyesIcon from '../../../assets/icons/ic-emotion-eyes.svg';
import Header, {HEADER_HEIGHT} from '../../../components/Header';
import {setAppLockPassword} from '../../../utils/appLockPasswordManager';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PASSWORD_LENGTH = 4;

type PasswordBoxStatus = 'inactive' | 'inputting' | 'success' | 'error';

const PASSWORD_BOX_STYLE = {
  inactive: {color: '#f4f4f4', showEyes: false},
  inputting: {color: '#191919', showEyes: true},
  success: {color: '#48C06D', showEyes: true},
  error: {color: '#F36A89', showEyes: true},
};

interface PasswordBoxProps {
  status: PasswordBoxStatus;
}

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

type PasswordStep = 'new' | 'confirm';

interface PasswordInputAreaProps {
  password: string;
  error: boolean;
  step: PasswordStep;
}

const PasswordInputArea = ({password, error, step}: PasswordInputAreaProps) => {
  const getBoxStatus = useCallback(
    (
      idx: number,
      pw: string,
      isError: boolean,
      currentStep: PasswordStep,
    ): PasswordBoxStatus => {
      if (pw.length === PASSWORD_LENGTH) {
        if (currentStep === 'confirm') {
          return isError ? 'error' : 'success';
        }
        // 'new' 단계에서는 4자리 입력해도 inputting 유지
        return 'inputting';
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
        getBoxStatus(idx, password, error, step),
      ),
    [password, error, step, getBoxStatus],
  );
  return (
    <View style={styles.inputBoxWrap}>
      {inputBoxStatusList.map((status, idx) => (
        <PasswordBox key={idx} status={status} />
      ))}
    </View>
  );
};

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

const SetAppLockPasswordScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerOffset = HEADER_HEIGHT + insets.top;
  const [step, setStep] = useState<PasswordStep>('new');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleNumPress = (num: string) => {
    if (step === 'new') {
      if (newPassword.length >= PASSWORD_LENGTH) {
        return;
      }
      const next = newPassword + num;
      setNewPassword(next);
      setIsError(false);
      setErrorMsg('');
      if (next.length === PASSWORD_LENGTH) {
        setTimeout(() => setStep('confirm'), 500);
      }
    } else {
      if (confirmPassword.length >= PASSWORD_LENGTH) {
        return;
      }
      const next = confirmPassword + num;
      setConfirmPassword(next);
      setIsError(false);
      setErrorMsg('');
      if (next.length === PASSWORD_LENGTH) {
        if (next === newPassword) {
          setAppLockPassword(next)
            .then(() => {
              Alert.alert(
                '비밀번호 설정 완료',
                '앱 잠금 비밀번호가 저장되었습니다.',
                [{text: '확인', onPress: () => navigation.goBack()}],
              );
            })
            .catch(() => {
              setIsError(true);
              setErrorMsg('비밀번호 저장에 실패했습니다. 다시 시도해 주세요.');
              setNewPassword('');
              setConfirmPassword('');
              setStep('new');
            });
        } else {
          setIsError(true);
          setErrorMsg('비밀번호가 일치하지 않습니다. 다시 시도해 주세요.');
          setTimeout(() => {
            setNewPassword('');
            setConfirmPassword('');
            setStep('new');
            setIsError(false);
            setErrorMsg('');
          }, 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'new') {
      if (newPassword.length === 0) {
        return;
      }
      setNewPassword(newPassword.slice(0, -1));
      setIsError(false);
      setErrorMsg('');
    } else {
      if (confirmPassword.length === 0) {
        return;
      }
      setConfirmPassword(confirmPassword.slice(0, -1));
      setIsError(false);
      setErrorMsg('');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="앱 잠금 비밀번호 설정"
        onBackPress={() => navigation.goBack()}
      />
      <View
        style={[
          styles.titleWrap,
          {marginTop: SCREEN_HEIGHT * 0.188 - headerOffset},
        ]}>
        <Text style={styles.title}>
          {step === 'new'
            ? '새 비밀번호를 입력해주세요'
            : '비밀번호를 한 번 더 입력해주세요'}
        </Text>
        <Text style={styles.subtitle}>
          앱 잠금에 사용할 4자리 숫자를 입력하세요.
        </Text>
      </View>
      <PasswordInputArea
        password={step === 'new' ? newPassword : confirmPassword}
        error={isError}
        step={step}
      />
      {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
      <NumPad
        onPress={handleNumPress}
        onBackspace={handleBackspace}
        disabled={
          step === 'new'
            ? newPassword.length === PASSWORD_LENGTH
            : confirmPassword.length === PASSWORD_LENGTH
        }
      />
    </View>
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
  errorMsg: {
    color: '#F36A89',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 0,
    fontFamily: 'Pretendard',
    fontWeight: '500',
  },
});

export default SetAppLockPasswordScreen;
