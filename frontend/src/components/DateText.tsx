import * as React from 'react';
import {StyleSheet, Text} from 'react-native';

const DateText = (props: any) => {
  return <Text style={[styles.text, props.style]}>2025년 5월 21일 수요일</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    letterSpacing: -0.1,
    lineHeight: 20,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.83)',
    textAlign: 'center',
  },
});

export default DateText;
