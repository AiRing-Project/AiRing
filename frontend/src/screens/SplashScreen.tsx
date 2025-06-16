import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CharacterLogo from '../assets/logos/logo-character.svg';
import WordMarkLogo from '../assets/logos/logo-wordmark.svg';
import AppScreen from '../components/layout/AppScreen';

const SplashScreen = () => {
  return (
    <AppScreen style={styles.container}>
      <ShakingCharacterLogo />
      <WordMarkLogo />
      <View style={styles.loadingContainer}>
        <Text style={styles.subText}>잠시만 기다려주세요...</Text>
        <ActivityIndicator color="#A7A7A7" />
      </View>
    </AppScreen>
  );
};

const ShakingCharacterLogo = () => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: -3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [shakeAnim]);

  const rotate = shakeAnim.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <Animated.View style={{transform: [{rotate}]}}>
      <CharacterLogo />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A7A7A7',
  },
});

export default SplashScreen;
