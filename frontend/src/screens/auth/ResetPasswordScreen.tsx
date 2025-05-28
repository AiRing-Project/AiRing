import {yupResolver} from '@hookform/resolvers/yup';
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

const schema = yup.object({
  currentPassword: yup.string().required('현재 비밀번호를 입력하세요.'),
  newPassword: yup
    .string()
    .min(6, '새 비밀번호는 6자 이상이어야 합니다.')
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
    // 실제 API 연동은 추후 구현
    console.log(data);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('비밀번호 변경', '비밀번호가 성공적으로 변경되었습니다.');
      reset();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>
      <Controller
        control={control}
        name="currentPassword"
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[
              styles.input,
              errors.currentPassword &&
                (errors.currentPassword.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="현재 비밀번호"
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
          <TextInput
            style={[
              styles.input,
              errors.newPassword &&
                (errors.newPassword.type !== 'required' || isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="새 비밀번호"
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
          <TextInput
            style={[
              styles.input,
              errors.newPasswordConfirm &&
                (errors.newPasswordConfirm.type !== 'required' ||
                  isSubmitted) &&
                styles.errorInput,
            ]}
            placeholder="새 비밀번호 확인"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.resetButton, loading && styles.disabledButton]}
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.resetButtonText}>비밀번호 재설정</Text>
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
    fontSize: 24,
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
  resetButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ResetPasswordScreen;
