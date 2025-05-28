import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {logoutApi} from '../../api/authApi';
import type {SettingsStackParamList} from '../../navigation/SettingsStack';
import {useAuthStore} from '../../store/authStore';
import {getRefreshToken, removeTokens} from '../../utils/tokenManager';

const SettingsScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>
    >();
  const setLoggedIn = useAuthStore(s => s.setLoggedIn);

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
      await removeTokens();
      setLoggedIn(false);
    } catch (e) {
      Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>설정 탭</Text>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.menuButtonText}>비밀번호 재설정</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 24,
  },
  logoutButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
