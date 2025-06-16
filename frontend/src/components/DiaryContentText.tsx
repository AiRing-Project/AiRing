import * as React from 'react';
import {StyleSheet, Text} from 'react-native';

const Component = (props: any) => {
  return (
    <Text style={[styles.text, props.style]}>
      {
        '"오전엔 멀쩡했는데, 오후엔 울적했어요... 회사에서 오전에회의를 했었는데, 실수를 하는 바람에 상사분한테 크게 혼이\n났거든요..."'
      }
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    letterSpacing: -0.1,
    lineHeight: 20,
    color: '#000',
    textAlign: 'left',
    fontWeight: '500',
    marginTop: -22,
  },
});

export default Component;
