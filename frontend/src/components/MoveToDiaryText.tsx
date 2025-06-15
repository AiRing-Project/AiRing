import * as React from 'react';
import {StyleSheet, Text} from 'react-native';

const Component = () => {
  return <Text style={styles.text}>일기장으로 이동</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#999',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    width: 101,
    height: 22,
  },
});

export default Component;
