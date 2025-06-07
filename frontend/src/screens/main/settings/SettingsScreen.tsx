import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import {logout} from '../../../api/authApi';
import IcEllipse from '../../../assets/icons/ic-ellipse.svg';
import IcLock from '../../../assets/icons/ic-lock.svg';
import IcPerson from '../../../assets/icons/ic-person.svg';
import IcPhone from '../../../assets/icons/ic-phone.svg';
import IcPieChart from '../../../assets/icons/ic-pie-chart.svg';
import IcSetting from '../../../assets/icons/ic-setting.svg';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import {useAuthStore} from '../../../store/authStore';
import {getRefreshToken, removeTokens} from '../../../utils/tokenManager';

const SettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {user, setLoggedIn} = useAuthStore();

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken);
      }
      await removeTokens();
      setLoggedIn(false);
    } catch (e) {
      Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
    }
  };

  return (
    <AppScreen isTabScreen>
      {/* 프로필 */}
      <View style={styles.profileBox}>
        <View style={styles.profileIconContainer}>
          <IcEllipse style={styles.ellipseIcon} />
          <IcPerson style={styles.personIcon} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.username}님</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 메뉴 */}
      <View style={{gap: 10}}>
        <ListItem
          leftIcon={<IcSetting width={22} height={22} />}
          label="앱 설정"
        />
        <ListItem
          leftIcon={<IcLock width={22} height={22} />}
          label="보안 설정"
          onPress={() => navigation.navigate('SecuritySettings')}
        />
        <ListItem
          leftIcon={<IcPhone width={22} height={22} />}
          label="AI 설정"
        />
        <ListItem
          leftIcon={<IcPieChart width={22} height={22} />}
          label="데이터 관리"
        />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  profileBox: {
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    width: '100%',
    height: 105,
    marginBottom: 30,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  ellipseIcon: {
    width: 50,
    height: 50,
  },
  personIcon: {
    width: 28,
    height: 28,
    position: 'absolute',
    top: 11,
    left: 11,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '600',

    color: '#000',
  },
  profileEmail: {
    fontSize: 12,
    letterSpacing: 0.2,
    fontWeight: '500',

    color: '#8a8a8a',
  },
  logoutBtn: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: 75,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '600',

    color: '#000',
  },
});

export default SettingsScreen;
