import * as React from 'react';
import {StyleSheet, View} from 'react-native';

const Rectangle15004 = (props: any) => {
  return (
    <View style={[styles.rectangleView, props.style]}>{props.children}</View>
  );
};

const styles = StyleSheet.create({
  rectangleView: {
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    height: 79,
  },
});

export default Rectangle15004;
