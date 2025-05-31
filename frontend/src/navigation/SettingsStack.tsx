import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import MyPageScreen from '../screens/main/settings/MyPageScreen';
import ResetPasswordScreen from '../screens/main/settings/ResetPasswordScreen';
import SettingsScreen from '../screens/main/settings/SettingsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ResetPassword: undefined;
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="MyPage" component={MyPageScreen} />
  </Stack.Navigator>
);

export default SettingsStack;
