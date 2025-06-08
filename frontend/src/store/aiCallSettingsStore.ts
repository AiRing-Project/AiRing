import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

// 옵션 타입 정의 (스크린과 동일하게)
export type AiCallOptionType = 'vibrate' | 'callBack' | 'voice';

export const VIBRATE_LIST = ['Basic', 'HeartBeat'];
export const CALLBACK_LIST = [
  '10분 후',
  '20분 후',
  '30분 후',
  '40분 후',
  '50분 후',
  '1시간 후',
];
export const VOICE_LIST = [
  {label: 'Sol', description: '차분함'},
  {label: 'Neo', description: '섬세함'},
  {label: 'Gina', description: '유쾌함'},
];

export interface AiCallSettingsState {
  selectedDays: number[]; // 0:월 ~ 6:일
  time: string; // 'HH:mm' 형식 (Date 객체는 직렬화 불가하므로 string)
  vibrate: {
    enabled: boolean;
    value: string; // 예: 'basic', 'strong' 등
  };
  callBack: {
    enabled: boolean;
    value: string; // 예: '10min', '5min' 등
  };
  voice: string; // 예: 'Sol', 'Neo' 등
  setSelectedDays: (days: number[]) => void;
  setTime: (time: string) => void;
  setVibrate: (vibrate: {enabled: boolean; value: string}) => void;
  setCallBack: (callBack: {enabled: boolean; value: string}) => void;
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
      vibrate: {enabled: true, value: VIBRATE_LIST[0]},
      callBack: {enabled: true, value: CALLBACK_LIST[0]},
      voice: VOICE_LIST[0].label,
      setSelectedDays: days => set({selectedDays: days}),
      setTime: time => set({time}),
      setVibrate: vibrate => set({vibrate}),
      setCallBack: callBack => set({callBack}),
      setVoice: voice => set({voice}),
    }),
    {
      name: 'ai-call-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        selectedDays: state.selectedDays,
        time: state.time,
        vibrate: state.vibrate,
        callBack: state.callBack,
        voice: state.voice,
      }),
    },
  ),
);
