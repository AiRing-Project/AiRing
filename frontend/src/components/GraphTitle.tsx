import * as React from 'react';
import {StyleSheet, Text} from 'react-native';

const GraphTitle = () => {
  return <Text style={styles.text}>감정 변화 그래프</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    width: 175,
    height: 22,
  },
});

export default GraphTitle;
