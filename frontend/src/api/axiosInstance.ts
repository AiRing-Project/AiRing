import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

// 요청 시 access token 자동 삽입
api.interceptors.request.use(async config => {
    const accessToken = await AsyncStorage.getItem('accessToken');
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
                // refresh token 불러오기
                const creds = await Keychain.getGenericPassword();
                if (!creds) { throw new Error('No refresh token'); }
                const refreshToken = creds.password;

                // 새 access token 요청
                const res = await api.post('/auth/reissue', { refreshToken });

                const newAccessToken = res.data.accessToken;
                const newRefreshToken = res.data.refreshToken;

                // 새 토큰 저장
                await AsyncStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                    await Keychain.setGenericPassword('refreshToken', newRefreshToken);
                }

                // 원래 요청에 새 토큰 추가 후 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // refresh token 만료 또는 오류 → 로그아웃
                await AsyncStorage.removeItem('accessToken');
                await Keychain.resetGenericPassword();

                Alert.alert('세션 만료', '다시 로그인해주세요.');
                useAuthStore.getState().setLoggedIn(false);

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
