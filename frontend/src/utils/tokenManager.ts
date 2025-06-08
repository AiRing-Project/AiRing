import * as Keychain from 'react-native-keychain';

import {reissueToken} from '../api/authApi';
import {useAuthStore} from '../store/authStore';

const REFRESH_TOKEN_SERVICE = 'AiRingRefreshToken';

export async function saveTokens(accessToken: string, refreshToken?: string) {
  useAuthStore.getState().setAccessToken(accessToken);
  if (refreshToken) {
    await Keychain.setGenericPassword('refreshToken', refreshToken, {
      service: REFRESH_TOKEN_SERVICE,
    });
  }
}

export async function removeTokens() {
  useAuthStore.getState().setAccessToken(null);
  await Keychain.resetGenericPassword({service: REFRESH_TOKEN_SERVICE});
}

export async function getRefreshToken(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({
    service: REFRESH_TOKEN_SERVICE,
  });
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
