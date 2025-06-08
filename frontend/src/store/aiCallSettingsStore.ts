import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

// 옵션 타입 정의 (스크린과 동일하게)
export type AiCallOptionType = 'vibrate' | 'call' | 'voice';

export interface AiCallSettingsState {
  selectedDays: number[]; // 0:월 ~ 6:일
  time: string; // 'HH:mm' 형식 (Date 객체는 직렬화 불가하므로 string)
  vibrate: {
    enabled: boolean;
    value: string; // 예: 'basic', 'strong' 등
  };
  call: {
    enabled: boolean;
    value: string; // 예: '10min', '5min' 등
  };
  voice: string; // 예: 'Sol', 'Neo' 등
  setSelectedDays: (days: number[]) => void;
  setTime: (time: string) => void;
  setVibrate: (vibrate: {enabled: boolean; value: string}) => void;
  setCall: (call: {enabled: boolean; value: string}) => void;
  setVoice: (voice: string) => void;
}

const defaultTime = (() => {
  const d = new Date();
  d.setHours(20);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  // HH:mm 포맷
  return d.toTimeString().slice(0, 5);
})();

export const useAiCallSettingsStore = create<AiCallSettingsState>()(
  persist(
    set => ({
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      time: defaultTime,
      vibrate: {enabled: true, value: 'basic'},
      call: {enabled: true, value: '10min'},
      voice: 'Sol',
      setSelectedDays: days => set({selectedDays: days}),
      setTime: time => set({time}),
      setVibrate: vibrate => set({vibrate}),
      setCall: call => set({call}),
      setVoice: voice => set({voice}),
    }),
    {
      name: 'ai-call-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        selectedDays: state.selectedDays,
        time: state.time,
        vibrate: state.vibrate,
        call: state.call,
        voice: state.voice,
      }),
    },
  ),
);
