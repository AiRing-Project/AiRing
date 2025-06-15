import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const AnalysisText = (props: any) => {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.textLine}>이번 주엔 기분 좋은 날이 많았어요.</Text>
      <Text style={styles.textLine}>
        특히 목요일과 토요일에 기쁨이 자주 감지되었어요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textLine: {
    fontSize: 12,
    letterSpacing: -0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
});

export default AnalysisText;
