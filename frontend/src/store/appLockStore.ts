import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {getAppLockPassword} from '../utils/appLockPasswordManager';

interface AppLockState {
  isLocked: boolean;
  password: string | null;
  isLoading: boolean;
  checkAppLock: () => Promise<void>;
  setLocked: (locked: boolean) => void;
}

export const useAppLockStore = create<AppLockState>()(
  persist(
    set => ({
      isLocked: true,
      password: null,
      isLoading: true,
      checkAppLock: async () => {
        try {
          const savedPassword = await getAppLockPassword();
          set({
            password: savedPassword,
            isLocked: !!savedPassword,
            isLoading: false,
          });
        } catch (error) {
          set({
            password: null,
            isLocked: false,
            isLoading: false,
          });
        }
      },
      setLocked: locked => set({isLocked: locked}),
    }),
    {
      name: 'app-lock-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isLocked: state.isLocked,
        password: state.password,
      }),
    },
  ),
);
