import {create} from 'zustand';

import {getAppLockPassword} from '../utils/appLockPasswordManager';

interface AppLockState {
  isLocked: boolean;
  password: string | null;
  isLoading: boolean;
  checkAppLock: () => Promise<void>;
  setLocked: (locked: boolean) => void;
}

export const useAppLockStore = create<AppLockState>(set => ({
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
}));
