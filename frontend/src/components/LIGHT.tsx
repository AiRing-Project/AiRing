import * as React from 'react';
import {StyleSheet, Text} from 'react-native';

const LIGHT = (props: any) => {
  return <Text style={[styles.light, props.style]}>LIGHT</Text>;
};

const styles = StyleSheet.create({
  light: {
    fontSize: 10,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'left',
  },
});

export default LIGHT;
