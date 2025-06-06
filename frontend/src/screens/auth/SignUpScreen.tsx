import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation} from '@react-navigation/native';
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
} from 'react-native';
import * as yup from 'yup';

import {signUp} from '../../api/authApi';
import AppScreen from '../../components/AppScreen';
import type {AuthStackParamList} from '../../navigation/AuthStack';

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

  const schema = yup.object({
    email: yup
      .string()
      .email('이메일 형식이 올바르지 않습니다.')
      .required('이메일을 입력하세요.'),
    password: yup
      .string()
      .min(6, '비밀번호는 6자 이상이어야 합니다.')
      .required('비밀번호를 입력하세요.'),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref('password'), undefined], '비밀번호가 일치하지 않습니다.')
      .required('비밀번호를 한 번 더 입력하세요.'),
    username: yup
      .string()
      .min(2, '이름은 2자 이상이어야 합니다.')
      .max(10, '이름은 10자 이하로 입력하세요.')
      .required('이름을 입력하세요.'),
  });

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
    <AppScreen style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
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
          <TextInput
            style={[
              styles.input,
              errors.password &&
                (errors.password.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="비밀번호"
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
          <TextInput
            style={[
              styles.input,
              errors.passwordConfirm &&
                (errors.passwordConfirm.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="비밀번호 확인"
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
        name="username"
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[
              styles.input,
              errors.username &&
                (errors.username.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="사용자 이름"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.disabledButton]}
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>회원가입</Text>
        )}
      </TouchableOpacity>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
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
  signUpButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SignUpScreen;
