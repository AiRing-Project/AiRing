/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import notifee, {
  AndroidNotificationSetting,
  EventType,
} from '@notifee/react-native';
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';

import AuthStack from './src/navigation/AuthStack';
import HomeTabs from './src/navigation/HomeTabs';
import AppLockScreen from './src/screens/AppLockScreen';
import AiCallSettingsScreen from './src/screens/main/call/AiCallSettingsScreen';
import CallActiveScreen from './src/screens/main/call/CallActiveScreen';
import IncomingCallScreen from './src/screens/main/call/IncomingCallScreen';
import CallLogDetailScreen from './src/screens/main/call-log/CallLogDetailScreen';
import ResetPasswordScreen from './src/screens/main/settings/ResetPasswordScreen';
import SecuritySettingsScreen from './src/screens/main/settings/SecuritySettingsScreen';
import SelectCallBackScreen from './src/screens/main/settings/SelectCallBackScreen';
import SelectVibrateScreen from './src/screens/main/settings/SelectVibrateScreen';
import SelectVoiceScreen from './src/screens/main/settings/SelectVoiceScreen';
import SetAppLockPasswordScreen from './src/screens/main/settings/SetAppLockPasswordScreen';
import SplashScreen from './src/screens/SplashScreen';
import {useAppLockStore} from './src/store/appLockStore';
import {useAuthStore} from './src/store/authStore';
import {createVibrationChannels} from './src/utils/alarmManager';

export type RootStackParamList = {
  Auth: undefined;

  AppLock: undefined;
  Home: undefined;

  // Call Modal 내부 화면
  AiCallSettings: {
    vibrate?: string;
    callBack?: string;
    voice?: string;
  };
  IncomingCall: undefined;
  CallActive: undefined;

  // Call Log Tab 내부 화면
  CallLogDetailScreen: {
    id: number;
  };

  // Settings Tab 내부 화면
  SecuritySettings: undefined;
  ResetPassword: undefined;
  SetAppLockPassword: undefined;
  SelectVibrate: {
    vibrate: string;
  };
  SelectCallBack: {
    callBack: string;
  };
  SelectVoice: {
    voice: string;
  };
};

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['airing://'],
  // override initial URL resolution:
  async getInitialURL(): Promise<string | null | undefined> {
    // 1) Did Notifee launch us?
    const initialNotification = await notifee.getInitialNotification();
    console.log('App lauched from killed state', initialNotification);
    if (initialNotification) {
      const link = initialNotification.notification.data?.link;
      if (link) {
        return link as string;
      }
    }
    // 2) Fallback to usual deep-link or cold URL
    return Linking.getInitialURL();
  },
  config: {
    screens: {
      IncomingCall: 'incoming-call',
    },
  },
};

const App = () => {
  const {isLoading: isAuthLoading, isLoggedIn, checkAuth} = useAuthStore();
  const {
    isLoading: isAppLockLoading,
    isLocked,
    checkAppLock,
  } = useAppLockStore();

  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAppLock();
  }, [isLoggedIn, checkAppLock]);

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
  }, []);

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

  // 채널 생성
  useEffect(() => {
    createVibrationChannels();
  }, []);

  if (isAuthLoading || isAppLockLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking} ref={navigationRef}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoggedIn ? (
            <>
              {isLocked ? (
                <Stack.Screen name="AppLock" component={AppLockScreen} />
              ) : (
                <>
                  <Stack.Screen name="Home" component={HomeTabs} />

                  {/* Call Modal 내부 화면 */}
                  <Stack.Screen
                    name="AiCallSettings"
                    component={AiCallSettingsScreen}
                  />
                  <Stack.Screen
                    name="IncomingCall"
                    component={IncomingCallScreen}
                  />
                  <Stack.Screen
                    name="CallActive"
                    component={CallActiveScreen}
                  />

                  {/* Call Log Tab 내부 화면 */}
                  <Stack.Screen
                    name="CallLogDetailScreen"
                    component={CallLogDetailScreen}
                  />

                  {/* Settings Tab 내부 화면 */}
                  <Stack.Screen
                    name="SecuritySettings"
                    component={SecuritySettingsScreen}
                  />
                  <Stack.Screen
                    name="ResetPassword"
                    component={ResetPasswordScreen}
                  />
                  <Stack.Screen
                    name="SetAppLockPassword"
                    component={SetAppLockPasswordScreen}
                  />
                  <Stack.Screen
                    name="SelectVibrate"
                    component={SelectVibrateScreen}
                  />
                  <Stack.Screen
                    name="SelectCallBack"
                    component={SelectCallBackScreen}
                  />
                  <Stack.Screen
                    name="SelectVoice"
                    component={SelectVoiceScreen}
                  />
                </>
              )}
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
