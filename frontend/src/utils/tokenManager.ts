import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import {reissueToken} from '../api/authApi';

export async function saveTokens(accessToken: string, refreshToken?: string) {
  await AsyncStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    await Keychain.setGenericPassword('refreshToken', refreshToken);
  }
}

export async function removeTokens() {
  await AsyncStorage.removeItem('accessToken');
  await Keychain.resetGenericPassword();
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem('accessToken');
}

export async function getRefreshToken(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword();
  if (creds && typeof creds === 'object' && 'password' in creds) {
    return creds.password;
  }
  return null;
}

// refreshToken으로 토큰 재발급 및 저장, 실패 시 삭제
export async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    const {accessToken, refreshToken: newRefreshToken} = await reissueToken(
      refreshToken,
    );
    await saveTokens(accessToken, newRefreshToken);
    return true;
  } catch {
    await removeTokens();
    return false;
  }
}
