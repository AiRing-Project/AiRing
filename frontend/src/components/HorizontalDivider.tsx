import React from 'react';
import {Dimensions, StyleSheet, View, ViewStyle} from 'react-native';

interface HorizontalDividerProps {
  style?: ViewStyle;
  marginHorizontal?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const HorizontalDivider: React.FC<HorizontalDividerProps> = ({
  style,
  marginHorizontal = -20,
}) => {
  return (
    <View
      style={[styles.divider, {marginHorizontal, width: SCREEN_WIDTH}, style]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    height: 10,
    borderRadius: 0,
  },
});

export default HorizontalDivider;
