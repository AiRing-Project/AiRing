import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Alert, TextInput, View} from 'react-native';
import * as yup from 'yup';

import {signUp} from '../../api/authApi';
import FormButton from '../../components/common/FormButton';
import AppScreen from '../../components/layout/AppScreen';
import Header from '../../components/layout/Header';
import type {AuthStackParamList} from '../../navigation/AuthStack';
import {loginStyles} from './LoginScreen';

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
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password'), undefined], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호를 한 번 더 입력하세요.'),
  username: yup
    .string()
    .matches(
      /^[A-Za-z0-9가-힣]+$/,
      '이름은 한글, 영어, 숫자만 입력 가능합니다.',
    )
    .min(1, '이름은 1자 이상이어야 합니다.')
    .max(10, '이름은 10자 이하로 입력하세요.')
    .required('이름을 입력하세요.'),
});

interface SignUpFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
}

const SignUpScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignUp'>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameFocused, setUsernameFocused] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitted},
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      await signUp({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      Alert.alert(
        '회원가입 완료',
        `${data.username}님, 반가워요! 이제 로그인해 주세요.`,
      );
      navigation.popTo('Login');
    } catch (e: any) {
      let alertMessage = '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      const status = e?.response?.status;
      if (status === 409) {
        alertMessage = '이미 가입된 계정입니다.';
      } else if (e?.response?.data?.message) {
        alertMessage = e.response.data.message;
      }
      Alert.alert('회원가입 실패', alertMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <Header
        title="회원가입"
        onBackPress={() => navigation.goBack()}
        marginBottom={44}
      />
      <View style={loginStyles.container}>
        <View style={loginStyles.formContainer}>
          <Controller
            control={control}
            name="username"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                style={[
                  loginStyles.input,
                  errors.username &&
                    (errors.username.type !== 'required' || isSubmitted) &&
                    loginStyles.errorInput,
                ]}
                placeholder={
                  usernameFocused ? '한글, 영어, 숫자만 가능해요' : '이름'
                }
                placeholderTextColor={'rgba(0, 0, 0, 0.25)'}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => {
                  setUsernameFocused(false);
                  onBlur();
                }}
              />
            )}
          />
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
                textContentType="emailAddress"
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
                autoComplete="new-password"
                textContentType="newPassword"
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
          <Controller
            control={control}
            name="passwordConfirm"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                style={[
                  loginStyles.input,
                  errors.passwordConfirm &&
                    (errors.passwordConfirm.type !== 'required' ||
                      isSubmitted) &&
                    loginStyles.errorInput,
                ]}
                placeholder="비밀번호 확인"
                placeholderTextColor={'rgba(0, 0, 0, 0.25)'}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
        <FormButton
          title="회원가입"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
        />
      </View>
    </AppScreen>
  );
};

export default SignUpScreen;
