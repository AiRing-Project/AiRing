import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {CALLBACK_LIST, VIBRATE_LIST, VOICE_LIST} from '../constants/aiCall';
import {updateScheduledAlarms} from '../utils/alarmManager';

export interface AiCallSettingsState {
  selectedDays: number[]; // 0:월 ~ 6:일
  time: string; // 'HH:mm' 형식
  vibrate: {
    enabled: boolean;
    value: (typeof VIBRATE_LIST)[number]['label'];
  };
  callBack: {
    enabled: boolean;
    value: (typeof CALLBACK_LIST)[number]['label'];
  };
  voice: (typeof VOICE_LIST)[number]['label'];
  setSelectedDays: (days: number[]) => void;
  setTime: (time: string) => void;
  setVibrate: (vibrate: {enabled: boolean; value: string}) => void;
  setCallBack: (callBack: {enabled: boolean; value: string}) => void;
  setVoice: (voice: string) => void;

  // 알람 등록 여부 -> 앱 첫 실행 시 알람 등록
  isAlarmRegistered: boolean;
  setAlarmRegistered: (value: boolean) => void;
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

      isAlarmRegistered: false,
      setAlarmRegistered: value => set({isAlarmRegistered: value}),
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

        isAlarmRegistered: state.isAlarmRegistered,
      }),
      onRehydrateStorage: () => async state => {
        if (!state?.isAlarmRegistered) {
          state?.setAlarmRegistered(true);
          try {
            console.log('[Alarm] register once after rehydrate');
            await updateScheduledAlarms();
          } catch (err) {
            console.error('[Alarm] failed to register scheduled alarms', err);
            state?.setAlarmRegistered(false); // 롤백 -> 다음 부팅 때 재시도
          }
        }
      },
    },
  ),
);
