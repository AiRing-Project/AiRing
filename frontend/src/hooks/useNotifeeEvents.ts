import notifee, {EventType} from '@notifee/react-native';
import {useEffect} from 'react';

const useNotifeeEvents = (navigationRef: React.RefObject<any>) => {
  useEffect(() => {
    // Background 이벤트 처리
    notifee.onBackgroundEvent(async ({type, detail}) => {
      if (
        type === EventType.PRESS ||
        (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'accept')
      ) {
        console.log('Background 이벤트 처리', detail.notification?.data);
        navigationRef.current?.navigate('IncomingCall');
      }
    });

    // Foreground 이벤트 처리
    const unsubscribeFg = notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.DELIVERED || type === EventType.PRESS) {
        if (
          detail.notification?.data?.link &&
          typeof detail.notification?.data?.link === 'string' &&
          detail.notification?.data?.link.includes('incoming-call')
        ) {
          console.log('Foreground 이벤트 처리', detail.notification?.data);
          await notifee.cancelNotification(detail.notification.id!);
          navigationRef.current?.navigate('IncomingCall');
        }
      }
    });

    // Cold start 시 알림 확인
    (async () => {
      const initial = await notifee.getInitialNotification();
      console.log('Cold start 시 알림 확인 data:', initial?.pressAction);
    })();

    return () => {
      unsubscribeFg();
    };
  }, [navigationRef]);
};

export default useNotifeeEvents;
