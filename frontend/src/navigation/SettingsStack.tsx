import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

export default SettingsStack;
