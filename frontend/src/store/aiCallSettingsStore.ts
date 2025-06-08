import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

// Vibrate 옵션: label + 실제 패턴
export const VIBRATE_LIST = [
  {label: 'Basic', pattern: [0, 500, 200, 500]},
  {label: 'HeartBeat', pattern: [0, 100, 100, 300, 100, 700]},
];

// CallBack 옵션: label + 분 단위 value
export const CALLBACK_LIST = [
  {label: '10분 후', value: 10},
  {label: '20분 후', value: 20},
  {label: '30분 후', value: 30},
  {label: '40분 후', value: 40},
  {label: '50분 후', value: 50},
  {label: '1시간 후', value: 60},
];

// Voice 옵션: label + description + id
export const VOICE_LIST = [
  {label: 'Sol', description: '차분함', id: 'sol'},
  {label: 'Neo', description: '섬세함', id: 'neo'},
  {label: 'Gina', description: '유쾌함', id: 'gina'},
];

export interface AiCallSettingsState {
  selectedDays: number[]; // 0:월 ~ 6:일
  time: string; // 'HH:mm' 형식
  vibrate: {
    enabled: boolean;
    value: string; // label (예: 'Basic')
  };
  callBack: {
    enabled: boolean;
    value: string; // label (예: '10분 후')
  };
  voice: string; // label (예: 'Sol')
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
  return d.toTimeString().slice(0, 5);
})();

export const useAiCallSettingsStore = create<AiCallSettingsState>()(
  persist(
    set => ({
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      time: defaultTime,
      vibrate: {enabled: true, value: VIBRATE_LIST[0].label},
      callBack: {enabled: true, value: CALLBACK_LIST[0].label},
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
