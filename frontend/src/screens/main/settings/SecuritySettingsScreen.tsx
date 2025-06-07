import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import ListItem from '../../../components/common/ListItem';
import Switch from '../../../components/common/Switch';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import {
  getAppLockPassword,
  removeAppLockPassword,
} from '../../../utils/appLockPasswordManager';

const SecuritySettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [appLock, setAppLock] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAppLockPassword().then(pw => setAppLock(!!pw));
    }, []),
  );

  const handleAppLockSwitch = async (value: boolean) => {
    if (value) {
      setAppLock(true);
      navigation.navigate('SetAppLockPassword');
    } else {
      await removeAppLockPassword();
      setAppLock(false);
    }
  };

  return (
    <AppScreen>
      <Header
        title="보안 설정"
        onBackPress={() => navigation.goBack()}
        marginBottom={40}
      />

      <View style={{gap: 10}}>
        <ListItem
          label="비밀번호 변경"
          onPress={() => navigation.navigate('ResetPassword')}
        />
        <ListItem
          label="앱 잠금"
          rightIcon={
            <Switch value={appLock} onValueChange={handleAppLockSwitch} />
          }
        />
      </View>
    </AppScreen>
  );
};

export default SecuritySettingsScreen;
