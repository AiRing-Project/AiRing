import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import CallLogDetailScreen from '../screens/main/call-log/CallLogDetailScreen';
import CallLogScreen from '../screens/main/call-log/CallLogScreen';

export type CallLogStackParamList = {
  CallLogScreen: undefined;
  CallLogDetailScreen: {
    id: number;
  };
};

const Stack = createNativeStackNavigator<CallLogStackParamList>();

const CallLogStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CallLogScreen" component={CallLogScreen} />
      <Stack.Screen
        name="CallLogDetailScreen"
        component={CallLogDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default CallLogStack;
