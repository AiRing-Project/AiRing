import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import type {AuthStackParamList} from '../types/navigation';
import {loginApi} from '../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {useAuthStore} from '../store/authStore';

// CompositeNavigationProp<현재Stack, 부모Stack>
type LoginScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Login'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const setLoggedIn = useAuthStore(s => s.setLoggedIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const {accessToken, refreshToken} = await loginApi({email, password});
      await AsyncStorage.setItem('accessToken', accessToken);
      await Keychain.setGenericPassword('refreshToken', refreshToken);
      setLoggedIn(true);
    } catch (e: any) {
      const status = e?.response?.status;
      const url = e?.response?.config?.url;
      const message =
        e?.response?.data?.message || e.message || '알 수 없는 오류';
      Alert.alert(
        '로그인 실패',
        `상태 코드: ${status ?? '-'}\n요청 URL: ${
          url ?? '-'
        }\n메시지: ${message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />
      <TouchableOpacity
        style={[styles.loginButton, loading && {opacity: 0.6}]}
        activeOpacity={0.8}
        onPress={handleLogin}
        disabled={loading}>
        <Text style={styles.loginButtonText}>
          {loading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>아직 계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupLink}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 16,
    color: '#222',
  },
  signupLink: {
    fontSize: 16,
    color: '#5d8fc5',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
