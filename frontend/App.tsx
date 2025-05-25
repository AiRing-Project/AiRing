/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';

import CalendarScreen from './src/screens/CalendarScreen';
import ReportScreen from './src/screens/ReportScreen';
import LogScreen from './src/screens/LogScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Dummy(빈) 화면 컴포넌트
const DummyScreen = () => <View style={{flex: 1, backgroundColor: '#fff'}} />;

function CustomTabBar({
  state,
  descriptors,
  navigation,
  onCallPress,
}: BottomTabBarProps & {onCallPress: () => void}) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        // 가운데(3번째) 탭에만 전화 버튼을 Floating하게 배치
        if (index === 2) {
          return (
            <View key={route.key} style={styles.dummyTab}>
              <TouchableOpacity
                style={styles.fab}
                onPress={onCallPress}
                activeOpacity={0.8}>
                <Icon name="phone" size={36} color="#fff" />
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

  let iconName = '';
  if (route.name === 'Diary') iconName = 'calendar-today';
  if (route.name === 'Report') iconName = 'bar-chart';
  if (route.name === 'Log') iconName = 'chat';
  if (route.name === 'Settings') iconName = 'settings';

  return (
    <TouchableOpacity
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      onPress={() => navigation.navigate(route.name)}
      style={styles.tabItem}
      activeOpacity={0.7}>
      <Icon name={iconName} size={32} color="#BDBDBD" />
      <Text style={styles.tabLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => (
            <CustomTabBar
              {...props}
              onCallPress={() => setModalVisible(true)}
            />
          )}
          screenOptions={{headerShown: false}}>
          <Tab.Screen
            name="Diary"
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
            component={LogScreen}
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
          onRequestClose={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>AI 전화 예약</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>통화하기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 90,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    color: '#BDBDBD',
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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

export default App;
