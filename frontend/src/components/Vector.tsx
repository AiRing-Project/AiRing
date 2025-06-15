import * as React from 'react';
import {StyleSheet} from 'react-native';

import Vector1 from '../assets/icons/ic-UnderBar.svg';

const Vector = () => {
  return <Vector1 style={styles.vectorIcon} />;
};

const styles = StyleSheet.create({
  vectorIcon: {
    flex: 1,
    width: '100%',
    height: 5,
  },
});

export default Vector;
