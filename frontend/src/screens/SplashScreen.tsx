import React from 'react';
import {ActivityIndicator, StyleSheet, Text} from 'react-native';

import AppScreen from '../components/layout/AppScreen';

const SplashScreen = () => {
  return (
    <AppScreen style={styles.container}>
      <Text style={styles.logo}>AiRing</Text>
      <ActivityIndicator size="large" color="#5d8fc5" style={styles.spinner} />
      <Text style={styles.loadingText}>잠시만 기다려주세요...</Text>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#5d8fc5',
    marginBottom: 32,
    letterSpacing: 2,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
});

export default SplashScreen;
