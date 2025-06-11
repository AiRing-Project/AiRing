import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Defs, Path, RadialGradient, Rect, Stop} from 'react-native-svg';

interface EmotionIconProps {
  colors?: string[]; // 그라데이션 색상 배열 (2개)
  size?: number; // 박스 크기
}

const DEFAULT_SIZE = 54;

const EmotionIcon = ({
  colors = ['#FFDB08', '#FF9900'],
  size = DEFAULT_SIZE,
}: EmotionIconProps) => (
  <View
    style={[
      styles.container,
      {width: size, height: size, borderRadius: (size * 10) / DEFAULT_SIZE},
    ]}>
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`}
      style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="grad" cx="41%" cy="40%" r="61%" fx="41%" fy="40%">
          <Stop offset="0%" stopColor={colors[0]} stopOpacity={0.6} />
          <Stop offset="100%" stopColor={colors[1]} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={DEFAULT_SIZE}
        height={DEFAULT_SIZE}
        rx={10}
        fill="url(#grad)"
      />
      {/* 눈 그룹: 좌표는 54x54 기준 */}
      <Path
        d="M21.7415 21.7217V27.2029"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M32.8528 21.7217V27.2029"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    shadowColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 6,
    elevation: 6,
    shadowOpacity: 1,
    overflow: 'hidden',
    position: 'relative',
  },
});

export default EmotionIcon;
