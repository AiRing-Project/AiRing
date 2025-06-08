import {yupResolver} from '@hookform/resolvers/yup';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';

import {getUserInfo, login} from '../../api/authApi';
import FormButton from '../../components/common/FormButton';
import AppScreen from '../../components/layout/AppScreen';
import Header from '../../components/layout/Header';
import type {AuthStackParamList} from '../../navigation/AuthStack';
import {useAuthStore} from '../../store/authStore';
import {saveTokens} from '../../utils/tokenManager';

const schema = yup.object({
  email: yup
    .string()
    .email('이메일 형식이 올바르지 않습니다.')
    .required('이메일을 입력하세요.'),
  password: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      '숫자, 영문 포함 8자리 이상 입력해주세요',
    )
    .required('비밀번호를 입력하세요.'),
});

// 폼 데이터 타입 분리
interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const {setLoggedIn, setUser} = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

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
      const {accessToken, refreshToken} = await login({
        email: data.email,
        password: data.password,
      });
      await saveTokens(accessToken, refreshToken);
      const user = await getUserInfo();
      setUser(user);
      setLoggedIn(true);
    } catch (e: any) {
      let alertMessage = '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      const status = e?.response?.status;
      if (status === 401) {
        alertMessage = '가입되지 않은 계정이거나 비밀번호가 올바르지 않습니다.';
      } else if (e?.response?.data?.message) {
        alertMessage = e.response.data.message;
      }
      Alert.alert('로그인 실패', alertMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <Header
        title="이메일로 로그인"
        onBackPress={() => navigation.goBack()}
        marginBottom={44}
      />
      <View style={loginStyles.container}>
        <View style={loginStyles.formContainer}>
          <Controller
            control={control}
            name="email"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                style={[
                  loginStyles.input,
                  errors.email &&
                    (errors.email.type !== 'required' || isSubmitted) &&
                    loginStyles.errorInput,
                ]}
                placeholder={
                  emailFocused ? '이메일 형식으로 입력해주세요' : '이메일'
                }
                placeholderTextColor={'rgba(0, 0, 0, 0.25)'}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="username"
                value={value}
                onChangeText={onChange}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  onBlur();
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                style={[
                  loginStyles.input,
                  errors.password &&
                    (errors.password.type !== 'required' || isSubmitted) &&
                    loginStyles.errorInput,
                ]}
                placeholder={
                  passwordFocused
                    ? '숫자, 영문 포함 8자리 이상 입력해주세요'
                    : '비밀번호'
                }
                placeholderTextColor={'rgba(0, 0, 0, 0.25)'}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  onBlur();
                }}
              />
            )}
          />
        </View>
        <FormButton
          title="로그인"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
        />
        <View style={loginStyles.signupContainer}>
          <Text style={loginStyles.signupText}>아직 계정이 없으신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={loginStyles.signupLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
};

export const loginStyles = StyleSheet.create({
  container: {
    gap: 30,
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 15,
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#fff',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1.5,
    width: '100%',
    height: 60,
    paddingHorizontal: 25,
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  errorInput: {
    borderColor: '#ec7575',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  signupLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '600',
    color: '#5d8fc5',
  },
});

export default LoginScreen;
