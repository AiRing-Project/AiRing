import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import {VIBRATE_LIST} from '../../../store/aiCallSettingsStore';

interface VibrateItemProps {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}

const VibrateItem = ({label, onPress, isSelected}: VibrateItemProps) => {
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

const SelectVibrateScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectVibrate'>>();
  const {vibrate: preVibrate} = route.params;
  const [selectedVibrate, setSelectedVibrate] = useState(preVibrate);

  const handleSelect = (vibrate: string) => setSelectedVibrate(vibrate);

  return (
    <AppScreen>
      <Header
        title="진동"
        onBackPress={() =>
          navigation.popTo('AiCallSettings', {vibrate: selectedVibrate})
        }
        marginBottom={40}
      />
      <View style={{gap: 10}}>
        {VIBRATE_LIST.map(item => (
          <VibrateItem
            key={item}
            label={item}
            isSelected={selectedVibrate === item}
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

export default SelectVibrateScreen;
