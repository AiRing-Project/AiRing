import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {PASSWORD_LENGTH, PasswordBoxStatus} from '../../constants/password';
import PasswordBox from './PasswordBox';

interface PasswordInputAreaProps {
  password: string;
  error: boolean;
  step?: 'new' | 'confirm' | 'verify';
}

const PasswordInputArea = ({password, error, step}: PasswordInputAreaProps) => {
  const getBoxStatus = useCallback(
    (
      idx: number,
      pw: string,
      isError: boolean,
      currentStep?: 'new' | 'confirm' | 'verify',
    ): PasswordBoxStatus => {
      if (pw.length === PASSWORD_LENGTH) {
        if (currentStep === 'verify') {
          return isError ? 'error' : 'success';
        }
        if (currentStep === 'new') {
          return 'inputting';
        }
        if (currentStep === 'confirm') {
          return isError ? 'error' : 'success';
        }
        return 'success';
      }
      if (pw.length > idx) {
        return 'inputting';
      }
      return 'inactive';
    },
    [],
  );

  const inputBoxStatusList = useMemo(
    () =>
      Array.from({length: PASSWORD_LENGTH}).map((_, idx) =>
        getBoxStatus(idx, password, error, step),
      ),
    [password, error, step, getBoxStatus],
  );

  return (
    <View style={styles.inputBoxWrap}>
      {inputBoxStatusList.map((status, idx) => (
        <PasswordBox key={idx} status={status} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  inputBoxWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    width: '100%',
    height: 70,
  },
});

export default PasswordInputArea;
