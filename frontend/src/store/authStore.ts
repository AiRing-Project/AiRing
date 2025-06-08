import {SKIP_AUTH} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {getUserInfo, UserInfo} from '../api/authApi';
import {tryRefreshToken} from '../utils/tokenManager';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: UserInfo;
  accessToken: string | null;
  setLoading: (val: boolean) => void;
  setLoggedIn: (val: boolean) => void;
  setUser: (user: UserInfo) => void;
  setAccessToken: (token: string | null) => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoading: true,
      isLoggedIn: false,
      user: {email: '', username: ''},
      accessToken: null,
      setLoading: (val: boolean) => set({isLoading: val}),
      setLoggedIn: (val: boolean) => set({isLoggedIn: val}),
      setUser: (user: UserInfo) => set({user}),
      setAccessToken: (token: string | null) => set({accessToken: token}),
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
        const token = get().accessToken;
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
          accessToken: null,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
