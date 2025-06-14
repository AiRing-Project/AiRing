import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import {CALLBACK_LIST} from '../../../constants/aiCall';

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

const SelectCallBackScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectCallBack'>>();
  const {callBack: preCallBack} = route.params;
  const [selectedCallBack, setSelectedCallBack] = useState(preCallBack);

  const handleSelect = (callBack: string) => setSelectedCallBack(callBack);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // 헤더 뒤로가기(onBackPress)에서 이미 popTo를 호출한 경우는 무시
      if (
        e.data.action.type === 'POP_TO_TOP' ||
        e.data.action.type === 'POP' ||
        e.data.action.type === 'GO_BACK'
      ) {
        e.preventDefault();
        navigation.popTo('AiCallSettings', {callBack: selectedCallBack});
      }
    });
    return unsubscribe;
  }, [navigation, selectedCallBack]);

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
            key={item.label}
            label={item.label}
            isSelected={selectedCallBack === item.label}
            onPress={() => handleSelect(item.label)}
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

export default SelectCallBackScreen;
