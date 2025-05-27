import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../types/navigation';
import type {RootStackParamList} from '../types/navigation';
import {signUpApi} from '../api/authApi';

// CompositeNavigationProp<현재Stack, 부모Stack>
type SignUpScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'SignUp'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert(
        '입력 오류',
        '이메일, 비밀번호, 사용자 이름을 모두 입력해주세요.',
      );
      return;
    }
    setLoading(true);
    try {
      await signUpApi({email, username, password});
      Alert.alert('회원가입 완료', '이제 로그인해 주세요.');
      navigation.replace('Login');
    } catch (e: any) {
      const status = e?.response?.status;
      const url = e?.response?.config?.url;
      const message =
        e?.response?.data?.message || e.message || '알 수 없는 오류';
      Alert.alert(
        '회원가입 실패',
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
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextInput
        style={styles.input}
        placeholder="사용자 이름"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.signUpButton, loading && {opacity: 0.6}]}
        activeOpacity={0.8}
        onPress={handleSignUp}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>회원가입</Text>
        )}
      </TouchableOpacity>
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
  signUpButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
