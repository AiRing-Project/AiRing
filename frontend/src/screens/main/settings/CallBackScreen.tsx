import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import {CALLBACK_LIST} from '../../../store/aiCallSettingsStore';

interface CallBackItemProps {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}

const CallBackItem = ({label, onPress, isSelected}: CallBackItemProps) => {
  return (
    <ListItem
      label={label}
      rightIcon={<></>}
      onPress={onPress}
      containerStyle={isSelected ? styles.selectedContainer : undefined}
      labelStyle={isSelected ? styles.selectedText : undefined}
    />
  );
};

const CallBackScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CallBack'>>();
  const {callBack} = route.params;
  const [selectedCallBack, setSelectedCallBack] = useState(callBack);

  const handleSelect = (v: string) => setSelectedCallBack(v);

  return (
    <AppScreen>
      <Header
        title="다시 전화"
        onBackPress={() => {
          navigation.popTo('AiCallSettings', {callBack: selectedCallBack});
        }}
        marginBottom={40}
      />
      <View style={{gap: 10}}>
        {CALLBACK_LIST.map(item => (
          <CallBackItem
            key={item}
            label={item}
            isSelected={selectedCallBack === item}
            onPress={() => handleSelect(item)}
          />
        ))}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(88, 88, 88, 0.9)',
  },
  selectedContainer: {
    backgroundColor: '#232323',
  },
  selectedText: {
    color: '#fff',
  },
});

export default CallBackScreen;
