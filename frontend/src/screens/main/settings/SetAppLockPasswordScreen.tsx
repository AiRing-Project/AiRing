import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Alert, Dimensions, StyleSheet, Text, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import NumPad from '../../../components/password/NumPad';
import PasswordInputArea from '../../../components/password/PasswordInputArea';
import {HEADER_HEIGHT} from '../../../constants/layout';
import {PASSWORD_LENGTH} from '../../../constants/password';
import {setAppLockPassword} from '../../../utils/appLockPasswordManager';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SetAppLockPasswordScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState<'new' | 'confirm'>('new');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const resetError = () => {
    setIsError(false);
    setErrorMsg('');
  };

  const handleNumPress = (num: string) => {
    if (step === 'new') {
      if (newPassword.length >= PASSWORD_LENGTH) {
        return;
      }
      const next = newPassword + num;
      setNewPassword(next);
      resetError();
      if (next.length === PASSWORD_LENGTH) {
        setTimeout(() => setStep('confirm'), 500);
      }
    } else {
      if (confirmPassword.length >= PASSWORD_LENGTH) {
        return;
      }
      const next = confirmPassword + num;
      setConfirmPassword(next);
      resetError();
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
            resetError();
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
    } else {
      if (confirmPassword.length === 0) {
        return;
      }
      setConfirmPassword(confirmPassword.slice(0, -1));
    }
    resetError();
  };

  const handleClear = () => {
    if (step === 'new') {
      setNewPassword('');
    } else {
      setConfirmPassword('');
    }
    resetError();
  };

  return (
    <AppScreen>
      <Header
        title="앱 잠금 비밀번호 설정"
        onBackPress={() => navigation.goBack()}
      />
      <View
        style={[
          styles.titleWrap,
          {marginTop: SCREEN_HEIGHT * 0.188 - HEADER_HEIGHT},
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
        onClear={handleClear}
        disabled={
          step === 'new'
            ? newPassword.length === PASSWORD_LENGTH
            : confirmPassword.length === PASSWORD_LENGTH
        }
      />
    </AppScreen>
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
    color: '#0a0a05',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 0.3,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
  errorMsg: {
    color: '#F36A89',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 0,
    fontWeight: '500',
  },
});

export default SetAppLockPasswordScreen;
