import * as React from 'react';
import {StyleSheet, View} from 'react-native';

const Rectangle15000 = (props: any) => {
  return (
    <View style={[styles.rectangleView, props.style]}>{props.children}</View>
  );
};

const styles = StyleSheet.create({
  rectangleView: {
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 90,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});

export default Rectangle15000;
