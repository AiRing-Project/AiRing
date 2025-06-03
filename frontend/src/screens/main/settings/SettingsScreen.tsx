import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import {logoutApi} from '../../../api/authApi';
import IcChevronRight from '../../../assets/icons/ic-chevron-right.svg';
import IcEllipse from '../../../assets/icons/ic-Ellipse.svg';
import IcLock from '../../../assets/icons/ic-lock.svg';
import IcPerson from '../../../assets/icons/ic-person.svg';
import IcPhone from '../../../assets/icons/ic-phone.svg';
import IcPieChart from '../../../assets/icons/ic-pie-chart.svg';
import IcSetting from '../../../assets/icons/ic-setting.svg';
import {useAuthStore} from '../../../store/authStore';
import {getRefreshToken, removeTokens} from '../../../utils/tokenManager';

const SettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setLoggedIn = useAuthStore(s => s.setLoggedIn);

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
      await removeTokens();
      setLoggedIn(false);
    } catch (e) {
      Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 프로필 */}
      <View style={styles.profileBox}>
        <View style={{position: 'relative', width: 50, height: 50}}>
          <IcEllipse style={{width: 50, height: 50}} />
          <IcPerson
            style={{
              position: 'absolute',
              top: 11,
              left: 11,
              right: 11,
              bottom: 11,
              width: 28,
              height: 28,
            }}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {/* {username ? `${username}님` : '이름없음'} */}
            빵딩님
          </Text>
          {/* <Text style={styles.profileEmail}>{email || ''}</Text> */}
          <Text style={styles.profileEmail}>airing@gmail.com</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 메뉴 */}
      <View style={styles.menuBox}>
        <MenuItem icon={<IcSetting width={22} height={22} />} label="앱 설정" />
        <MenuItem
          icon={<IcLock width={22} height={22} />}
          label="보안 설정"
          onPress={() => navigation.navigate('SecuritySettings')}
        />
        <MenuItem icon={<IcPhone width={22} height={22} />} label="AI 설정" />
        <MenuItem
          icon={<IcPieChart width={22} height={22} />}
          label="데이터 관리"
        />
      </View>
    </View>
  );
};

const MenuItem = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
    <IcChevronRight width={16} height={16} style={styles.chevron} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 129,
    paddingBottom: 683,
  },
  statusBar: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  statusBarTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#170E2B',
  },
  profileBox: {
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    width: '100%',
    height: 105,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 27,
    paddingLeft: 19,
    paddingRight: 100,
    position: 'relative',
  },
  profileInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 15,
  },
  profileName: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#000',
    textAlign: 'left',
  },
  profileEmail: {
    fontSize: 12,
    letterSpacing: 0.2,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#8a8a8a',
    textAlign: 'left',
    marginTop: 6,
  },
  logoutBtn: {
    position: 'absolute',
    right: 21,
    top: 35.5,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: 75,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  menuBox: {},
  menuItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    justifyContent: 'space-between',
    height: 70,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: 'rgba(0,0,0,0.9)',
    textAlign: 'left',
    flex: 1,
  },
  emoji: {
    fontSize: 22,
  },
  chevron: {
    fontSize: 22,
    color: '#B6B6B6',
    marginLeft: 8,
  },
});

export default SettingsScreen;
