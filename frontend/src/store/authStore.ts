import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_BASE_URL } from '@env';

interface AuthState {
    isLoading: boolean;
    isLoggedIn: boolean;
    setLoading: (val: boolean) => void;
    setLoggedIn: (val: boolean) => void;
    checkAuth: () => Promise<void>;
}

function isTokenValid(token: string | null): boolean {
    if (!token) { return false; }
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoading: true,
    isLoggedIn: false,
    setLoading: (val: boolean) => set({ isLoading: val }),
    setLoggedIn: (val: boolean) => set({ isLoggedIn: val }),
    checkAuth: async () => {
        set({ isLoading: true });
        const token = await AsyncStorage.getItem('accessToken');
        if (isTokenValid(token)) {
            set({ isLoggedIn: true, isLoading: false });
            return;
        }
        // accessToken이 만료된 경우 refreshToken으로 자동 로그인 시도 (axios 기본 인스턴스 사용)
        try {
            const creds = await Keychain.getGenericPassword();
            if (!creds) { throw new Error('No refresh token'); }
            const refreshToken = creds.password;
            const res = await axios.post(`${API_BASE_URL}/auth/reissue`, { refreshToken }, { timeout: 5000 });
            const newAccessToken = res.data.accessToken;
            const newRefreshToken = res.data.refreshToken;
            await AsyncStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
                await Keychain.setGenericPassword('refreshToken', newRefreshToken);
            }
            set({ isLoggedIn: true, isLoading: false });
        } catch {
            await AsyncStorage.removeItem('accessToken');
            await Keychain.resetGenericPassword();
            set({ isLoggedIn: false, isLoading: false });
        }
    },
}));
