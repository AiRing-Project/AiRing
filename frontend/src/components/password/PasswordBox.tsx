import React from 'react';
import {StyleSheet} from 'react-native';

import EmojiBox from '../common/EmojiBox';
import {PASSWORD_BOX_STYLE, PasswordBoxStatus} from './constants';

interface PasswordBoxProps {
  status: PasswordBoxStatus;
}

const PasswordBox = ({status}: PasswordBoxProps) => {
  const {color, showEyes} = PASSWORD_BOX_STYLE[status];

  return (
    <EmojiBox
      size={70}
      backgroundColor={color}
      eyesColor="#fff"
      showEyes={showEyes}
      style={styles.inputBox}
    />
  );
};

const styles = StyleSheet.create({
  inputBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1.5,
    marginHorizontal: 0,
    position: 'relative',
  },
});

export default PasswordBox;
