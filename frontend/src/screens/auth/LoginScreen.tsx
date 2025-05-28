import {yupResolver} from '@hookform/resolvers/yup';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';

import {loginApi} from '../../api/authApi';
import type {AuthStackParamList} from '../../navigation/AuthStack';
import {useAuthStore} from '../../store/authStore';
import {saveTokens} from '../../utils/tokenManager';

const schema = yup.object({
  email: yup
    .string()
    .email('이메일 형식이 올바르지 않습니다.')
    .required('이메일을 입력하세요.'),
  password: yup.string().required('비밀번호를 입력하세요.'),
});

// 폼 데이터 타입 분리
interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const setLoggedIn = useAuthStore(s => s.setLoggedIn);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitted},
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  useFocusEffect(
    React.useCallback(() => {
      reset();
    }, [reset]),
  );

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const {accessToken, refreshToken} = await loginApi({
        email: data.email,
        password: data.password,
      });
      await saveTokens(accessToken, refreshToken);
      setLoggedIn(true);
    } catch (e: any) {
      let alertMessage = '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      if (__DEV__) {
        const status = e?.response?.status;
        const url = e?.response?.config?.url;
        const message =
          e?.response?.data?.message || e.message || '알 수 없는 오류';
        alertMessage = `상태 코드: ${status ?? '-'}\n요청 URL: ${
          url ?? '-'
        }\n메시지: ${message}`;
      }
      if (e?.response?.status === 401) {
        alertMessage = '가입되지 않은 계정이거나 비밀번호가 올바르지 않습니다.';
      }
      Alert.alert('로그인 실패', alertMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <Controller
        control={control}
        name="email"
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[
              styles.input,
              errors.email &&
                (errors.email.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="username"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[
              styles.input,
              errors.password &&
                (errors.password.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="비밀번호"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>로그인</Text>
        )}
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
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: '#ec7575',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
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
