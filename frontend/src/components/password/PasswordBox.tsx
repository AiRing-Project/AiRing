import React from 'react';
import {StyleSheet, View} from 'react-native';

import EyesIcon from '../../assets/icons/ic-emotion-eyes.svg';
import {PASSWORD_BOX_STYLE, PasswordBoxStatus} from './constants';

interface PasswordBoxProps {
  status: PasswordBoxStatus;
}

const PasswordBox = ({status}: PasswordBoxProps) => {
  const {color, showEyes} = PASSWORD_BOX_STYLE[status];

  return (
    <View
      style={[
        styles.inputBox,
        styles.inputBoxContent,
        {backgroundColor: color, borderColor: color},
      ]}>
      {showEyes && <EyesIcon />}
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1.5,
    marginHorizontal: 0,
  },
  inputBoxContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PasswordBox;
