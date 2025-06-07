import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {RootStackParamList} from '../../../../App';
import CallIcon from '../../../assets/icons/ic-call.svg';
import VibrateIcon from '../../../assets/icons/ic-vibrate.svg';
import VoiceIcon from '../../../assets/icons/ic-voice.svg';
import Switch from '../../../components/common/Switch';
import AppScreen from '../../../components/layout/AppScreen';
import Header from '../../../components/layout/Header';
import TimePicker from '../../../components/picker/TimePicker';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 옵션 타입 정의
type OptionType = 'vibrate' | 'call' | 'voice';

interface RepeatDaysCardProps {
  selectedDays: number[];
  onToggleDay: (idx: number) => void;
}

function RepeatDaysCard({selectedDays, onToggleDay}: RepeatDaysCardProps) {
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

interface OptionItemProps {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  toggled?: boolean;
  onPress: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
}

function OptionItem({
  icon,
  label,
  subLabel,
  toggled,
  onPress,
  onToggle,
  showToggle = true,
}: OptionItemProps) {
  return (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={onPress}
      activeOpacity={0.7}>
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
          <Switch value={!!toggled} onValueChange={onToggle ?? (() => {})} />
        ) : null)}
    </TouchableOpacity>
  );
}

interface OptionsCardProps {
  selectedOptions: OptionType[];
  onToggleOption: (option: OptionType) => void;
}

function OptionsCard({selectedOptions, onToggleOption}: OptionsCardProps) {
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
        onPress={() => {
          /* 리스트 이동 등 추후 구현 */
        }}
        onToggle={() => onToggleOption('vibrate')}
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
        onPress={() => {
          /* 리스트 이동 등 추후 구현 */
        }}
        onToggle={() => onToggleOption('call')}
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
        onPress={() => {
          /* 리스트 이동 등 추후 구현 */
        }}
        showToggle={false}
      />
    </View>
  );
}

interface BottomButtonRowProps {
  onCancel: () => void;
  onSave: () => void;
}

function BottomButtonRow({onCancel, onSave}: BottomButtonRowProps) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>취소</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const AiCallSettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // TODO: storage 값이 없으면 기본값을 다음과 같이, 있으면 그 값을 사용하도록 수정
  const [selectedDays, setSelectedDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(20);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  });
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

  const handleSave = () => {
    console.log('시간:', time.getHours(), '시', time.getMinutes(), '분');
    console.log('요일:', selectedDays); // 0:일, 1:월, ...
    console.log('진동:', selectedOptions.includes('vibrate'));
    console.log('다시 전화:', selectedOptions.includes('call'));
    console.log('AI 음성:', 'Sol');
  };

  return (
    <AppScreen style={styles.container}>
      <Header
        title="AI 전화 설정"
        onBackPress={() => navigation.goBack()}
        marginBottom={40}
      />
      <TimePicker value={time} onChange={setTime} />
      <RepeatDaysCard selectedDays={selectedDays} onToggleDay={toggleDay} />
      <OptionsCard
        selectedOptions={selectedOptions}
        onToggleOption={toggleOption}
      />
      <BottomButtonRow
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F1F1',
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
