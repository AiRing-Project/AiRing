/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
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
import SetAppLockPasswordScreen from './src/screens/main/settings/SetAppLockPasswordScreen';
import SplashScreen from './src/screens/SplashScreen';
import {useAppLockStore} from './src/store/appLockStore';
import {useAuthStore} from './src/store/authStore';

export type RootStackParamList = {
  Auth: undefined;

  AppLock: undefined;
  Home: undefined;

  // Call Modal 내부 화면
  AiCallSettings: undefined;
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
      <NavigationContainer>
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
