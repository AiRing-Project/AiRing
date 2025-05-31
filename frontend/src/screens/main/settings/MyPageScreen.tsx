import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {logoutApi} from '../../../api/authApi';
import IcChevronRight from '../../../assets/icons/ic-chevron-right.svg';
import IcLock from '../../../assets/icons/ic-lock.svg';
import IcPhone from '../../../assets/icons/ic-phone.svg';
import IcPieChart from '../../../assets/icons/ic-pie-chart.svg';
import IcSetting from '../../../assets/icons/ic-setting.svg';
import {getRefreshToken, removeTokens} from '../../../utils/tokenManager';

const handleLogout = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await logoutApi(refreshToken);
    }
    await removeTokens();
    // useAuthStore.getState().setUser(null, null);
  } catch (e) {
    Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
  }
};

const MyPageScreen = () => {
  // const username = useAuthStore(s => s.username);
  // const email = useAuthStore(s => s.email);

  return (
    <View style={styles.container}>
      {/* 상태바(커스텀) */}
      {/* <View style={styles.statusBar}>
        <Text style={styles.statusBarTime}>12:30</Text>
      </View> */}

      {/* 프로필 */}
      <View style={styles.profileBox}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{uri: 'https://placekitten.com/100/100'}}
            style={styles.avatar}
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
        <MenuItem icon={<IcLock width={22} height={22} />} label="보안 설정" />
        <MenuItem icon={<IcPhone width={22} height={22} />} label="AI 설정" />
        <MenuItem
          icon={<IcPieChart width={22} height={22} />}
          label="데이터 관리"
        />
      </View>
    </View>
  );
};

const MenuItem = ({icon, label}: {icon: React.ReactNode; label: string}) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuIcon}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
    <IcChevronRight width={22} height={22} style={styles.chevron} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
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
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(26,27,26,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInfo: {flex: 1},
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  logoutBtn: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
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

export default MyPageScreen;
