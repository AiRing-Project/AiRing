/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
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

  // 딥링크 이벤트 구독: airing://incoming-call 수신 시 IncomingCallScreen으로 이동
  useEffect(() => {
    const handleDeepLink = (event: {url: string}) => {
      const url = event.url;
      if (url && url.startsWith('airing://incoming-call')) {
        navigationRef.current?.navigate('IncomingCall');
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    // 앱이 cold start로 딥링크로 실행된 경우도 처리
    Linking.getInitialURL().then(url => {
      if (url && url.startsWith('airing://incoming-call')) {
        navigationRef.current?.navigate('IncomingCall');
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  if (isAuthLoading || isAppLockLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
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
