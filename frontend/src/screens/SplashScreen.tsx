import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AiRing</Text>
      <ActivityIndicator size="large" color="#5d8fc5" style={styles.spinner} />
      <Text style={styles.loadingText}>잠시만 기다려주세요...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
