import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {logoutApi} from '../../api/authApi';
import {useAuthStore} from '../../store/authStore';
import {getRefreshToken, removeTokens} from '../../utils/tokenManager';

const SettingsScreen = () => {
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
    marginTop: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
