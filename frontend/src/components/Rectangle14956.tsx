import * as React from 'react';
import {StyleSheet, View} from 'react-native';

const Rectangle14956 = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) => {
  return <View style={[styles.rectangleView, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  rectangleView: {
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    height: 99,
  },
});

export default Rectangle14956;
