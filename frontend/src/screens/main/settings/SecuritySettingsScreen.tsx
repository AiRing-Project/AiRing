import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {StyleSheet, Switch, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import Header from '../../../components/Header';
import ListItem from '../../../components/ListItem';
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
    <View style={styles.container}>
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
            <Switch
              value={appLock}
              onValueChange={handleAppLockSwitch}
              thumbColor={appLock ? '#48C06D' : '#ccc'}
              trackColor={{false: '#ccc', true: '#B6EFC6'}}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
});

export default SecuritySettingsScreen;
