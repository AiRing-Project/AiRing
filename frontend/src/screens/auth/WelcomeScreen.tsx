import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import AppScreen from '../../components/AppScreen';
import {AuthStackParamList} from '../../navigation/AuthStack';

const WelcomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();

  return (
    <AppScreen style={styles.container}>
      <View style={styles.centerBox}>
        <Text style={styles.logoText}>AiRing</Text>
      </View>
      <Text style={styles.welcomeText}>아이링에 오신 것을 환영해요 :)</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}>
        <Text style={styles.startButtonText}>시작하기</Text>
      </TouchableOpacity>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerBox: {
    width: 300,
    height: 130,
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 225,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '400',
    color: '#232323',
    fontFamily: 'Inter',
    letterSpacing: 2,
  },
  welcomeText: {
    marginTop: 20,
    fontSize: 20,
    color: '#232323',
    textAlign: 'center',
    fontWeight: '600',
  },
  startButton: {
    position: 'absolute',
    bottom: 100,
    left: 28,
    right: 28,
    backgroundColor: '#232323',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default WelcomeScreen;
