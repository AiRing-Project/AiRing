import {API_BASE_URL} from '@env';
import axios from 'axios';
import {Alert} from 'react-native';

import {useAuthStore} from '../store/authStore';
import {tryRefreshToken} from '../utils/tokenManager';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// 요청 시 access token 자동 삽입
api.interceptors.request.use(async config => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 시 401 처리 (refresh flow 포함)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const ok = await tryRefreshToken();
        if (ok) {
          // 새 accessToken으로 원래 요청 재시도
          const newAccessToken = useAuthStore.getState().accessToken;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          Alert.alert('세션 만료', '다시 로그인해주세요.');
          useAuthStore.getState().setLoggedIn(false);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        Alert.alert('세션 만료', '다시 로그인해주세요.');
        useAuthStore.getState().setLoggedIn(false);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
