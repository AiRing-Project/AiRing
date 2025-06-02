import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import MyPageScreen from '../screens/main/settings/MyPageScreen';
import ResetPasswordScreen from '../screens/main/settings/ResetPasswordScreen';
import SecuritySettingsScreen from '../screens/main/settings/SecuritySettingsScreen';
import SetAppLockPasswordScreen from '../screens/main/settings/SetAppLockPasswordScreen';
import SettingsScreen from '../screens/main/settings/SettingsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ResetPassword: undefined;
  MyPage: undefined;
  SecuritySettings: undefined;
  SetAppLockPassword: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="MyPage" component={MyPageScreen} />
    <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    <Stack.Screen
      name="SetAppLockPassword"
      component={SetAppLockPasswordScreen}
    />
  </Stack.Navigator>
);

export default SettingsStack;
