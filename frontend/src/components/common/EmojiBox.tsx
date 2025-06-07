import React from 'react';
import {StyleSheet, View} from 'react-native';

import EyesIcon from '../../assets/icons/ic-emotion-eyes.svg';

interface EmojiBoxProps {
  size?: number; // Box size (width/height)
  backgroundColor?: string;
  eyesColor?: string;
  showEyes?: boolean;
  style?: object;
}

const EmojiBox = ({
  size = 70,
  backgroundColor = '#fff',
  eyesColor = '#000',
  showEyes = true,
  style,
}: EmojiBoxProps) => {
  // EyesIcon의 크기를 박스 크기에 맞춰 비율로 조정 (기본 21x14에서 비율 유지)
  const eyesWidth = size * 0.3; // 21/70 ≈ 0.3
  const eyesHeight = size * 0.2; // 14/70 ≈ 0.2

  return (
    <View
      style={[styles.box, {width: size, height: size, backgroundColor}, style]}>
      {showEyes && (
        <View style={[styles.eyesWrapper, {top: size * 0.3}]}>
          <EyesIcon width={eyesWidth} height={eyesHeight} color={eyesColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  eyesWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default EmojiBox;
