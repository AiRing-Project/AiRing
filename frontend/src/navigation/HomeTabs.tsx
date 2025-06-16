import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {RootStackParamList} from '../../App';
import CalendarIcon from '../assets/icons/tab-calendar.svg';
import CenterIcon from '../assets/icons/tab-center.svg';
import LogIcon from '../assets/icons/tab-log.svg';
import ReportIcon from '../assets/icons/tab-report.svg';
import SettingsIcon from '../assets/icons/tab-settings.svg';
import CalendarScreen from '../screens/main/calendar/CalendarScreen';
import CallLogScreen from '../screens/main/call-log/CallLogScreen';
import ReportScreen from '../screens/main/report/ReportScreen';
import SettingsScreen from '../screens/main/settings/SettingsScreen';
import {initAiCall} from '../utils/aiCall';

const Tab = createBottomTabNavigator();

// Dummy(빈) 화면 컴포넌트
// eslint-disable-next-line react-native/no-inline-styles
const DummyScreen = () => <View style={{flex: 1, backgroundColor: '#fff'}} />;

function CustomTabBar({
  state,
  descriptors,
  navigation,
  onCallPress,
}: BottomTabBarProps & {onCallPress: () => void}) {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 85;

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}>
      {state.routes.map((route, index) => {
        // 가운데(3번째) 탭에만 전화 버튼을 Floating하게 배치
        if (index === 2) {
          return (
            <View key={route.key} style={styles.dummyTab}>
              <TouchableOpacity
                style={styles.fab}
                onPress={onCallPress}
                activeOpacity={0.8}>
                <CenterIcon width={18} height={18} fill="#fff" />
              </TouchableOpacity>
            </View>
          );
        }
        return renderTab(route, index, state, descriptors, navigation);
      })}
    </View>
  );
}

function renderTab(
  route: {key: string; name: string},
  index: number,
  state: TabNavigationState<ParamListBase>,
  descriptors: BottomTabBarProps['descriptors'],
  navigation: NavigationHelpers<ParamListBase>,
) {
  // Dummy 탭은 숨김
  if (route.name === 'Dummy') {
    return <View key={route.key} style={styles.dummyTab} />;
  }
  const {options} = descriptors[route.key];
  const label =
    typeof options.tabBarLabel === 'string'
      ? options.tabBarLabel
      : String(options.tabBarLabel);
  const isFocused = state.index === index;

  const ICON_MAP: Record<string, React.FC<any>> = {
    Calendar: CalendarIcon,
    Report: ReportIcon,
    Log: LogIcon,
    Settings: SettingsIcon,
  };

  const IconComponent = ICON_MAP[route.name] || (() => null);

  return (
    <TouchableOpacity
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      onPress={() => navigation.navigate(route.name)}
      style={styles.tabItem}
      activeOpacity={0.7}>
      <IconComponent
        width={22}
        height={22}
        fill={isFocused ? '#222222' : '#C9CACC'}
      />
      <Text
        style={[
          styles.tabLabel,
          isFocused ? styles.tabLabelFocused : styles.tabLabelUnfocused,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const HomeTabs = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCall = useCallback(async () => {
    if (isCalling) {
      return;
    }
    setIsCalling(true);
    await initAiCall({
      callType: 'outgoing',
      onSuccess: () => {
        setIsCalling(false);
        setModalVisible(false);
        navigation.navigate('CallActive');
      },
      onError: () => {
        setIsCalling(false);
      },
    });
  }, [isCalling, navigation]);

  const handleModalClose = useCallback(() => {
    if (!isCalling) {
      setModalVisible(false);
    }
  }, [isCalling]);

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar {...props} onCallPress={() => setModalVisible(true)} />
    ),
    [],
  );

  return (
    <>
      <Tab.Navigator tabBar={renderTabBar} screenOptions={{headerShown: false}}>
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{tabBarLabel: '캘린더'}}
        />
        <Tab.Screen
          name="Report"
          component={ReportScreen}
          options={{tabBarLabel: '레포트'}}
        />
        <Tab.Screen
          name="Dummy"
          component={DummyScreen}
          options={{tabBarLabel: ''}}
        />
        <Tab.Screen
          name="Log"
          component={CallLogScreen}
          options={{tabBarLabel: '기록'}}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{tabBarLabel: '설정'}}
        />
      </Tab.Navigator>
      {/* 커스텀 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}>
        <Pressable style={styles.modalOverlay} onPress={handleModalClose}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('AiCallSettings', {});
              }}
              disabled={isCalling}>
              <Text style={styles.modalButtonText}>AI 전화 예약</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCall}
              disabled={isCalling}>
              {isCalling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>통화하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.24,
    marginTop: 2,
  },
  tabLabelFocused: {color: '#222222'},
  tabLabelUnfocused: {color: '#B2B2B2'},
  fab: {
    width: 43,
    height: 43,
    borderRadius: 21.5,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dummyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 220,
    alignItems: 'center',
    elevation: 10,
  },
  modalButton: {
    width: 160,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#222',
    marginVertical: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeTabs;
