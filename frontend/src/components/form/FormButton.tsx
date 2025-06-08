import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

const FormButton = ({
  title,
  onPress,
  loading,
  disabled,
  style,
}: FormButtonProps) => (
  <TouchableOpacity
    style={[styles.loginButton, disabled && styles.disabledButton, style]}
    activeOpacity={0.8}
    onPress={onPress}
    disabled={disabled}>
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.loginButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  loginButton: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 1,
    borderRadius: 10,
    backgroundColor: '#232323',
    borderStyle: 'solid',
    borderColor: '#e7e7e7',
    borderWidth: 1,
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default FormButton;
