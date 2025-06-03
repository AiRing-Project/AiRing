import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import Header from '../../../components/Header';
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

      <View style={styles.cardList}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ResetPassword')}>
            <Text style={styles.menuText}>비밀번호 변경</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>앱 잠금</Text>
            <Switch
              value={appLock}
              onValueChange={handleAppLockSwitch}
              thumbColor={appLock ? '#48C06D' : '#ccc'}
              trackColor={{false: '#ccc', true: '#B6EFC6'}}
            />
          </View>
        </View>
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
  title: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 18,
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
  },
  cardList: {
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    color: 'rgba(0,0,0,0.9)',
  },
});

export default SecuritySettingsScreen;
