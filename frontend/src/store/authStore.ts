import {jwtDecode} from 'jwt-decode';
import {create} from 'zustand';

import {getAccessToken, tryRefreshToken} from '../utils/tokenManager';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  setLoading: (val: boolean) => void;
  setLoggedIn: (val: boolean) => void;
  setUser: (username: string | null, email: string | null) => void;
  checkAuth: () => Promise<void>;
}

function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }
  try {
    const {exp} = jwtDecode<{exp: number}>(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>(set => ({
  isLoading: true,
  isLoggedIn: false,
  username: null,
  email: null,
  setLoading: (val: boolean) => set({isLoading: val}),
  setLoggedIn: (val: boolean) => set({isLoggedIn: val}),
  setUser: (username, email) => set({username, email}),
  checkAuth: async () => {
    set({isLoading: true});
    const token = await getAccessToken();
    if (isTokenValid(token)) {
      set({isLoggedIn: true, isLoading: false});
      return;
    }
    // accessToken이 만료된 경우 refreshToken으로 자동 로그인 시도
    const ok = await tryRefreshToken();
    set({isLoggedIn: ok, isLoading: false});
  },
}));
