import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Alert, View} from 'react-native';
import * as yup from 'yup';

import {RootStackParamList} from '../../../../App';
import {resetPassword} from '../../../api/authApi';
import FormButton from '../../../components/form/FormButton';
import FormInput from '../../../components/form/FormInput';
import {formStyles} from '../../../components/form/styles';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';

const schema = yup.object({
  currentPassword: yup.string().required('현재 비밀번호를 입력하세요.'),
  newPassword: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      '숫자, 영문 포함 8자리 이상 입력해주세요',
    )
    .required('새 비밀번호를 입력하세요.'),
  newPasswordConfirm: yup
    .string()
    .oneOf([yup.ref('newPassword'), undefined], '비밀번호가 일치하지 않습니다.')
    .required('새 비밀번호를 한 번 더 입력하세요.'),
});

interface ResetPasswordFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

const ResetPasswordScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitted},
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      await resetPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('비밀번호 변경', '비밀번호가 성공적으로 변경되었습니다.');
      reset();
      navigation.goBack();
    } catch (e: any) {
      let msg = '비밀번호 변경에 실패했습니다.';
      const status = e?.response?.status;
      if (status === 400) {
        msg = '기존 비밀번호와 새 비밀번호가 같습니다.';
      } else if (status === 401) {
        msg = '현재 비밀번호가 일치하지 않습니다.';
      } else if (e?.response?.data?.message) {
        msg = e.response.data.message;
      }
      Alert.alert('비밀번호 변경 실패', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <Header
        title="비밀번호 변경"
        onBackPress={() => navigation.goBack()}
        marginBottom={44}
      />
      <View style={formStyles.container}>
        <View style={formStyles.formContainer}>
          <Controller
            control={control}
            name="currentPassword"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="기존 비밀번호"
                isError={
                  errors.currentPassword &&
                  (errors.currentPassword.type !== 'required' || isSubmitted)
                }
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="신규 비밀번호(영문, 숫자 포함 8자리 이상)"
                isError={
                  errors.newPassword &&
                  (errors.newPassword.type !== 'required' || isSubmitted)
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
            name="newPasswordConfirm"
            render={({field: {onChange, onBlur, value}}) => (
              <FormInput
                placeholder="신규 비밀번호 확인"
                isError={
                  errors.newPasswordConfirm &&
                  (errors.newPasswordConfirm.type !== 'required' || isSubmitted)
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
          title="변경하기"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
        />
      </View>
    </AppScreen>
  );
};

export default ResetPasswordScreen;
