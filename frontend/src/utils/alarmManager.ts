import notifee, {
  AndroidCategory,
  AndroidChannel,
  AndroidImportance,
  AndroidVisibility,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import {
  useAiCallSettingsStore,
  VIBRATE_LIST,
} from '../store/aiCallSettingsStore';
import {getNextDate} from './date';

/**
 * 앱 시작 시 Vibrate 패턴별 및 비활성화용 Notification Channel을 생성합니다.
 * VIBRATE_LIST에 정의된 각 패턴(label)마다 별도의 채널을 생성하고,
 * 진동 꺼짐용 채널(aiCallChannel-None)도 생성합니다.
 */
export async function createVibrationChannels(): Promise<void> {
  const baseChannelInfo: Omit<AndroidChannel, 'id'> = {
    name: 'Call from AiRing',
    vibration: false,
    bypassDnd: true,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  };

  // 진동 꺼짐 채널
  await notifee.createChannel({
    id: 'aiCallChannel-None',
    ...baseChannelInfo,
  });

  // 패턴별 채널 생성
  for (const {label, pattern} of VIBRATE_LIST) {
    const channelId = `aiCallChannel-${label}`;
    await notifee.createChannel({
      id: channelId,
      ...baseChannelInfo,
      vibration: true,
      vibrationPattern: pattern,
    });
  }
}

/**
 * 단발성 또는 주간 반복 알람을 예약합니다.
 * @param id            알람 식별용 고유 ID
 * @param dateTime      예약할 Date 객체
 * @param repeatWeekly  true일 경우 주간 반복 (WEEKLY), false면 단발성
 */
export async function scheduleAlarm(
  id: string,
  dateTime: Date,
  repeatWeekly: boolean,
): Promise<void> {
  const {vibrate} = useAiCallSettingsStore.getState();
  // 진동 설정에 따라 채널 선택
  const channelId = vibrate.enabled
    ? `aiCallChannel-${vibrate.value}`
    : 'aiCallChannel-None';

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: dateTime.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
    repeatFrequency: repeatWeekly ? RepeatFrequency.WEEKLY : undefined,
  };
  const formattedTime = dateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  await notifee.createTriggerNotification(
    {
      id,
      title: 'AiRing에게 전화가 왔어요!',
      body: `예약된 전화 알림 (${formattedTime})`,
      data: {
        link: 'airing://incoming-call',
      },
      android: {
        channelId,
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: {
          id: 'default',
        },
        lightUpScreen: true,
        colorized: true,
        actions: [
          {
            title: '❌ 거절',
            pressAction: {
              id: 'decline', // dismiss와 동일
            },
          },
          {
            title: '✅ 열기',
            pressAction: {
              id: 'accept', // 일반 알림 클릭과 동일
              launchActivity: 'default',
            },
          },
        ],
      },
    },
    trigger,
  );
}

/**
 * 모든 예약된 알람을 취소합니다.
 */
export async function cancelAllAlarms(): Promise<void> {
  await notifee.cancelAllNotifications();
}

/**
 * 설정 변경 시 기존 알람을 모두 삭제하고 새로 등록합니다.
 * - selectedDays: 0=일~6=월
 * - time: 'HH:mm'
 */
export async function updateScheduledAlarms(): Promise<void> {
  const {selectedDays, time} = useAiCallSettingsStore.getState();
  await cancelAllAlarms();

  const [hour, minute] = time.split(':').map(Number);
  for (const day of selectedDays) {
    const next = getNextDate(hour, minute, day);

    console.log('next', next.toString());

    const alarmId = `aiCall-${day}`;
    await scheduleAlarm(alarmId, next, true);
  }

  console.log('AllAlarms', await notifee.getTriggerNotificationIds());
}
