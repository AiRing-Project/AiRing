import React, {useState} from 'react';
import {StyleSheet, TextInput, TextInputProps} from 'react-native';

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  focusedPlaceholder?: string;
  secureTextEntry?: boolean;
  isError?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  style?: any;
}

const FormInput = ({
  value,
  onChangeText,
  onBlur,
  placeholder,
  focusedPlaceholder,
  secureTextEntry,
  isError,
  keyboardType,
  autoComplete,
  textContentType,
  style,
}: FormInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      style={[styles.input, style, isError && styles.errorInput]}
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
      placeholder={
        focused && focusedPlaceholder ? focusedPlaceholder : placeholder
      }
      placeholderTextColor={'rgba(0,0,0,0.25)'}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      textContentType={textContentType}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default FormInput;
