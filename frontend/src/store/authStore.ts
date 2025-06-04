import {SKIP_AUTH} from '@env';
import {jwtDecode} from 'jwt-decode';
import {create} from 'zustand';

import {getUserInfo, UserInfo} from '../api/authApi';
import {getAccessToken, tryRefreshToken} from '../utils/tokenManager';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: UserInfo;
  setLoading: (val: boolean) => void;
  setLoggedIn: (val: boolean) => void;
  setUser: (user: UserInfo) => void;
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

async function fetchAndSetUser(set: (state: Partial<AuthState>) => void) {
  try {
    const {email, username} = await getUserInfo();
    set({isLoggedIn: true, isLoading: false, user: {email, username}});
    return true;
  } catch {
    set({
      isLoggedIn: false,
      isLoading: false,
      user: {email: '', username: ''},
    });
    return false;
  }
}

export const useAuthStore = create<AuthState>(set => ({
  isLoading: true,
  isLoggedIn: false,
  user: {email: '', username: ''},
  setLoading: (val: boolean) => set({isLoading: val}),
  setLoggedIn: (val: boolean) => set({isLoggedIn: val}),
  setUser: (user: UserInfo) => set({user}),
  checkAuth: async () => {
    set({isLoading: true});
    if (SKIP_AUTH === 'true') {
      set({
        isLoggedIn: true,
        isLoading: false,
        user: {email: 'airing@dev.com', username: '아이링'},
      });
      return;
    }
    const token = await getAccessToken();
    if (isTokenValid(token)) {
      await fetchAndSetUser(set);
      return;
    }
    // accessToken이 만료된 경우 refreshToken으로 자동 로그인 시도
    const ok = await tryRefreshToken();
    if (ok) {
      await fetchAndSetUser(set);
      return;
    }
    set({
      isLoggedIn: false,
      isLoading: false,
      user: {email: '', username: ''},
    });
  },
}));
