import notifee, {AndroidNotificationSetting} from '@notifee/react-native';
import {useEffect} from 'react';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

const useNotificationPermissions = () => {
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS !== 'android') {
        return;
      }

      // 1) Android 13(API 33)+: POST_NOTIFICATIONS 권한 요청
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            '알림 권한 필요',
            '설정 → 앱 → AiRing → 알림에서 권한을 허용해 주세요.',
            [
              {text: '취소', style: 'cancel'},
              {text: '설정으로 이동', onPress: () => Linking.openSettings()},
            ],
          );
        }
      }

      // 2) Android 12(API 31)+: Exact Alarm 권한 확인 및 안내
      if (Platform.Version >= 31) {
        try {
          const settings = await notifee.getNotificationSettings();
          if (settings.android?.alarm === AndroidNotificationSetting.ENABLED) {
            console.log('Exact Alarm 허용됨');
          } else {
            Alert.alert(
              '정확한 알람 권한 필요',
              '앱이 종료되거나 절전 모드에서도 알람이 울리려면 Exact Alarm을 켜야 합니다.',
              [
                {text: '취소', style: 'cancel'},
                {
                  text: '설정으로 이동',
                  onPress: () => notifee.openAlarmPermissionSettings(),
                },
              ],
            );
          }
        } catch (e) {
          console.error('Exact Alarm 권한 확인 중 에러:', e);
        }
      }
    }

    requestPermissions();
  }, []);
};

export default useNotificationPermissions;
