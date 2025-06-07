import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import CallIcon from '../../../assets/icons/ic-call.svg';
import VibrateIcon from '../../../assets/icons/ic-vibrate.svg';
import VoiceIcon from '../../../assets/icons/ic-voice.svg';
import AppScreen from '../../../components/AppScreen';
import Header from '../../../components/Header';
import Switch from '../../../components/Switch';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 옵션 타입 정의
type OptionType = 'vibrate' | 'call' | 'voice';

function TimePickerCard({
  hour,
  minute,
  onPress,
}: {
  hour: number;
  minute: number;
  onPress: () => void;
}) {
  return (
    <View style={styles.timePickerWrapper}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.timeDisplayRow}>
          <View style={styles.timeIndicator} />
          <View style={styles.tempTimeDisplay}>
            <Text style={styles.ampmTextLeft}>오전</Text>
            <Text style={styles.tempTimeText}>
              {hour.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.tempTimeText}>
              {minute.toString().padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.timeIndicator} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function RepeatDaysCard({
  selectedDays,
  onToggleDay,
}: {
  selectedDays: number[];
  onToggleDay: (idx: number) => void;
}) {
  return (
    <View style={styles.repeatContainer}>
      <Text style={styles.repeatTitle}>반복</Text>
      <View style={styles.daysContainer}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.dayBtn,
              selectedDays.includes(i) && styles.dayBtnActive,
            ]}
            onPress={() => onToggleDay(i)}>
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(i) && styles.dayTextActive,
              ]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function OptionItem({
  icon,
  label,
  subLabel,
  toggled,
  onPress,
  showToggle = true,
}: {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  toggled?: boolean;
  onPress: () => void;
  showToggle?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={onPress}
      disabled={showToggle}>
      <View style={styles.optionIconLabel}>
        {icon}
        <View style={styles.optionLabelContainer}>
          <Text
            style={[styles.optionLabel, toggled && styles.optionLabelActive]}>
            {label}
          </Text>
          <Text style={styles.optionSubLabel}>{subLabel}</Text>
        </View>
      </View>
      {showToggle &&
        (toggled !== undefined ? (
          <Switch value={!!toggled} onValueChange={onPress} />
        ) : null)}
    </TouchableOpacity>
  );
}

function OptionsCard({
  selectedOptions,
  onToggleOption,
}: {
  selectedOptions: OptionType[];
  onToggleOption: (option: OptionType) => void;
}) {
  return (
    <View style={styles.optionsContainer}>
      <OptionItem
        icon={
          <VibrateIcon
            width={24}
            height={24}
            color={selectedOptions.includes('vibrate') ? '#000' : '#888'}
          />
        }
        label="진동"
        subLabel="Basic call"
        toggled={selectedOptions.includes('vibrate')}
        onPress={() => onToggleOption('vibrate')}
      />
      <OptionItem
        icon={
          <CallIcon
            width={24}
            height={24}
            color={selectedOptions.includes('call') ? '#000' : '#888'}
          />
        }
        label="다시 전화"
        subLabel="10분 후"
        toggled={selectedOptions.includes('call')}
        onPress={() => onToggleOption('call')}
      />
      <OptionItem
        icon={
          <VoiceIcon
            width={24}
            height={24}
            color={selectedOptions.includes('voice') ? '#000' : '#888'}
          />
        }
        label="AI 음성"
        subLabel="Sol"
        onPress={() => onToggleOption('voice')}
        showToggle={false}
      />
    </View>
  );
}

function BottomButtonRow() {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.cancelBtn}>
        <Text style={styles.cancelText}>취소</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const AiCallSettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [hour, _setHour] = useState<number>(8);
  const [minute, _setMinute] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([
    'vibrate',
    'call',
  ]);

  const toggleDay = (idx: number) => {
    setSelectedDays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx],
    );
  };

  const toggleOption = (option: OptionType) => {
    if (option === 'voice') {
      return;
    }
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option],
    );
  };

  return (
    <AppScreen style={styles.container}>
      <Header
        title="AI 전화 설정"
        onBackPress={() => navigation.goBack()}
        marginBottom={40}
      />
      <TimePickerCard
        hour={hour}
        minute={minute}
        onPress={() => {
          /* TODO: 시간 선택 휠 */
        }}
      />
      <RepeatDaysCard selectedDays={selectedDays} onToggleDay={toggleDay} />
      <OptionsCard
        selectedOptions={selectedOptions}
        onToggleOption={toggleOption}
      />
      <BottomButtonRow />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F7',
  },
  timePickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  timeIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E1E1E',
  },
  tempTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ampmTextLeft: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333333',
    marginRight: 10,
  },
  tempTimeText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333333',
    width: 60,
    textAlign: 'center',
    letterSpacing: -2,
  },
  colon: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 5,
  },
  repeatContainer: {
    marginBottom: 20,
  },
  repeatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    marginLeft: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 60,
    flex: 1,
  },
  dayBtnActive: {
    backgroundColor: '#232323',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.75)',
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 24,
    marginBottom: 24,
    justifyContent: 'space-between',
    height: 245,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  optionLabelContainer: {
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#222',
    fontWeight: '600',
  },
  optionSubLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 28,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#232323',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
  },
  cancelText: {
    color: '#232323',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AiCallSettingsScreen;
