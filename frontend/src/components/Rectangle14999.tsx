import * as React from 'react';
import {StyleSheet, View} from 'react-native';

const Rectangle14999 = (props: any) => {
  return (
    <View style={[styles.rectangleView, props.style]}>{props.children}</View>
  );
};

const styles = StyleSheet.create({
  rectangleView: {
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    width: '100%',
    height: 245,
    paddingHorizontal: 20, // 내부 콘텐츠를 위한 패딩
    paddingTop: 20, // 내부 콘텐츠를 위한 상단 패딩
  },
});

export default Rectangle14999;
