import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Alert, View} from 'react-native';
import * as yup from 'yup';

import {signUp} from '../../api/authApi';
import FormButton from '../../components/form/FormButton';
import FormInput from '../../components/form/FormInput';
import {formStyles} from '../../components/form/styles';
import AppScreen from '../../components/layout/AppScreen';
import Header from '../../components/layout/Header';
import type {AuthStackParamList} from '../../navigation/AuthStack';

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
      navigation.navigate('SignUpComplete', {username: data.username});
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
      <View style={formStyles.container}>
        <View style={formStyles.formContainer}>
          <Controller
            control={control}
            name="username"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="이름"
                focusedPlaceholder="한글, 영어, 숫자만 가능해요"
                isError={
                  errors.username &&
                  (errors.username.type !== 'required' || isSubmitted)
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="이메일"
                focusedPlaceholder="이메일 형식으로 입력해주세요"
                isError={
                  errors.email &&
                  (errors.email.type !== 'required' || isSubmitted)
                }
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
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
              <FormInput
                placeholder="비밀번호"
                focusedPlaceholder="숫자, 영문 포함 8자리 이상 입력해주세요"
                isError={
                  errors.password &&
                  (errors.password.type !== 'required' || isSubmitted)
                }
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="passwordConfirm"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="비밀번호 확인"
                isError={
                  errors.passwordConfirm &&
                  (errors.passwordConfirm.type !== 'required' || isSubmitted)
                }
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
