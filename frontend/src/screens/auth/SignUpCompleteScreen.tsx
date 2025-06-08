import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import CharacterLogo from '../../assets/logos/logo-character.svg';
import AppScreen from '../../components/layout/AppScreen';
import {AuthStackParamList} from '../../navigation/AuthStack';

const SignUpCompleteScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AuthStackParamList, 'SignUpComplete'>
    >();
  const route = useRoute<RouteProp<AuthStackParamList, 'SignUpComplete'>>();

  return (
    <AppScreen style={styles.container}>
      <View style={styles.centerBox}>
        <Text style={styles.mainText}>회원가입이 완료되었습니다</Text>
        <Text style={styles.subText}>{`${
          route.params?.username || '사용자'
        }님, 반가워요 🙌`}</Text>
      </View>
      <View style={styles.logoBox}>
        <CharacterLogo />
      </View>
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
    paddingHorizontal: 30,
    paddingTop: 132,
    paddingBottom: 132,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    gap: 18,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  mainText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#505050',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default SignUpCompleteScreen;
