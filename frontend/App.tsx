/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import notifee from '@notifee/react-native';
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';

import useNotifeeEvents from './src/hooks/useNotifeeEvents';
import useNotificationPermissions from './src/hooks/useNotificationPermissions';
import useVibrationChannels from './src/hooks/useVibrationChannels';
import AuthStack from './src/navigation/AuthStack';
import HomeTabs from './src/navigation/HomeTabs';
import AppLockScreen from './src/screens/AppLockScreen';
import DiaryScreen from './src/screens/main/calendar/DiaryScreen';
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
import {useAiCallSettingsStore} from './src/store/aiCallSettingsStore';
import {useAppLockStore} from './src/store/appLockStore';
import {useAuthStore} from './src/store/authStore';
import {Mode} from './src/types/diary';

export type RootStackParamList = {
  Auth: undefined;

  AppLock: undefined;
  Home: undefined;

  // Calendar Tab 내부 화면
  Diary: {
    id?: number;
    mode: Mode;
  };

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
  useAiCallSettingsStore(); // trigger rehydration

  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useNotificationPermissions();
  useNotifeeEvents(navigationRef);
  useVibrationChannels();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAppLock();
  }, [isLoggedIn, checkAppLock]);

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

                  {/* Calendar Tab 내부 화면 */}
                  <Stack.Screen name="Diary" component={DiaryScreen} />

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
