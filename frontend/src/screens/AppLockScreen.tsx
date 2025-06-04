import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';

import {RootStackParamList} from '../../App';
import {PASSWORD_LENGTH} from '../components/password/constants';
import NumPad from '../components/password/NumPad';
import PasswordInputArea from '../components/password/PasswordInputArea';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AppLockScreen = () => {
  const [password, setPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'AppLock'>>();

  const correctPassword = '1234'; // 테스트용 비밀번호
  const username = '아이링'; // 테스트용 사용자명

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

  const handleBackspace = () => {
    if (password.length === 0) {
      return;
    }
    setPassword(password.slice(0, -1));
    setIsError(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        {/* 상단 안내문구 */}
        <Text style={styles.title}>비밀번호를 입력해주세요</Text>
        <Text style={styles.subtitle}>
          이 일기는 {username}님만 볼 수 있어요!
        </Text>
      </View>

      {/* 비밀번호 네모 입력칸 */}
      <PasswordInputArea password={password} error={isError} step="verify" />
      {/* 커스텀 숫자 패드 */}
      <NumPad
        onPress={handleNumPress}
        onBackspace={handleBackspace}
        disabled={password.length === PASSWORD_LENGTH}
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
});

export default AppLockScreen;
