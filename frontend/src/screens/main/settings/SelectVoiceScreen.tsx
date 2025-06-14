import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import {VOICE_LIST} from '../../../constants/aiCall';

interface AiVoiceItemProps {
  label: string;
  description: string;
  onPress: () => void;
  isSelected: boolean;
}

const AiVoiceItem = ({
  label,
  description,
  onPress,
  isSelected,
}: AiVoiceItemProps) => {
  return (
    <ListItem
      label={label}
      rightIcon={
        <Text style={isSelected ? styles.selectedText : styles.text}>
          {description}
        </Text>
      }
      onPress={onPress}
      containerStyle={isSelected ? styles.selectedContainer : undefined}
      labelStyle={isSelected ? styles.selectedText : undefined}
    />
  );
};

const SelectVoiceScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectVoice'>>();
  const {voice: preVoice} = route.params;
  const [selectedVoice, setSelectedVoice] = useState(preVoice);

  const handleSelect = (voice: string) => setSelectedVoice(voice);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (
        e.data.action.type === 'POP_TO_TOP' ||
        e.data.action.type === 'POP' ||
        e.data.action.type === 'GO_BACK'
      ) {
        e.preventDefault();
        navigation.popTo('AiCallSettings', {voice: selectedVoice});
      }
    });
    return unsubscribe;
  }, [navigation, selectedVoice]);

  return (
    <AppScreen>
      <Header
        title="AI 음성"
        onBackPress={() =>
          navigation.popTo('AiCallSettings', {voice: selectedVoice})
        }
        marginBottom={40}
      />

      <View style={{gap: 10}}>
        {VOICE_LIST.map(item => (
          <AiVoiceItem
            key={item.label}
            label={item.label}
            description={item.description}
            isSelected={selectedVoice === item.label}
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

export default SelectVoiceScreen;
