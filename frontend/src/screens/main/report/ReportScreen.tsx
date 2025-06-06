import React from 'react';
import {StyleSheet, Text} from 'react-native';

import AppScreen from '../../../components/AppScreen';

const ReportScreen = () => {
  return (
    <AppScreen isTabScreen>
      <Text style={styles.text}>레포트 탭</Text>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignSelf: 'center',
  },
});

export default ReportScreen;
