import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
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
import {WEEK_DAYS} from '../../../constants/calendar';
import {useAiCallSettingsStore} from '../../../store/aiCallSettingsStore';
import {updateScheduledAlarms} from '../../../utils/alarmManager';
import {parseTimeToDate} from '../../../utils/date';

interface RepeatDaysCardProps {
  selectedDays: number[];
  onToggleDay: (idx: number) => void;
}

function RepeatDaysCard({selectedDays, onToggleDay}: RepeatDaysCardProps) {
  return (
    <View style={styles.repeatContainer}>
      <Text style={styles.repeatTitle}>반복</Text>
      <View style={styles.daysContainer}>
        {WEEK_DAYS.map((d, i) => {
          const realIdx = (i + 1) % 7;
          return (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayBtn,
                selectedDays.includes(realIdx) && styles.dayBtnActive,
              ]}
              onPress={() => onToggleDay(realIdx)}>
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(realIdx) && styles.dayTextActive,
                ]}>
                {d}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  hasToggle?: boolean;
}

function OptionItem({
  icon,
  label,
  subLabel,
  toggled,
  onPress,
  onToggle,
  hasToggle = false,
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
      {hasToggle &&
        (toggled !== undefined ? (
          <Switch value={!!toggled} onValueChange={onToggle ?? (() => {})} />
        ) : null)}
    </TouchableOpacity>
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
  const route = useRoute<RouteProp<RootStackParamList, 'AiCallSettings'>>();
  const {
    selectedDays: storeSelectedDays,
    time: storeTime,
    vibrate: storeVibrate,
    callBack: storeCallBack,
    voice: storeVoice,
    setSelectedDays,
    setTime,
    setVibrate,
    setCallBack,
    setVoice,
  } = useAiCallSettingsStore();

  // 로컬 상태로 관리
  const [selectedDays, setLocalSelectedDays] =
    useState<number[]>(storeSelectedDays);
  const [time, setLocalTime] = useState<string>(storeTime);
  const [vibrate, setLocalVibrate] = useState(storeVibrate);
  const [callBack, setLocalCallBack] = useState(storeCallBack);
  const [voice, setLocalVoice] = useState(storeVoice);

  // navigation param이 넘어오면 반영
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.voice) {
        setLocalVoice(route.params.voice);
        navigation.setParams({voice: undefined});
      }
      if (route.params?.vibrate) {
        setLocalVibrate(v => ({...v, value: route.params.vibrate ?? v.value}));
        navigation.setParams({vibrate: undefined});
      }
      if (route.params?.callBack) {
        setLocalCallBack(cb => ({
          ...cb,
          value: route.params.callBack ?? cb.value,
        }));
        navigation.setParams({callBack: undefined});
      }
    }, [
      route.params?.voice,
      route.params?.vibrate,
      route.params?.callBack,
      navigation,
    ]),
  );

  // 요일 토글
  const toggleDay = (idx: number) => {
    if (selectedDays.includes(idx)) {
      setLocalSelectedDays(selectedDays.filter(d => d !== idx));
    } else {
      setLocalSelectedDays([...selectedDays, idx]);
    }
  };

  // 진동/다시전화 on/off 토글
  const toggleVibrate = () =>
    setLocalVibrate({...vibrate, enabled: !vibrate.enabled});
  const toggleCallBack = () =>
    setLocalCallBack({...callBack, enabled: !callBack.enabled});

  // 시간 변경
  const handleTimeChange = (date: Date) => {
    const hhmm = date.toTimeString().slice(0, 5);
    setLocalTime(hhmm);
  };

  // 저장 버튼
  const handleSave = async () => {
    // 스토어 업데이트
    setSelectedDays(selectedDays);
    setTime(time);
    setVibrate(vibrate);
    setCallBack(callBack);
    setVoice(voice);
    // 알람 업데이트
    await updateScheduledAlarms();
    navigation.goBack();
  };

  return (
    <AppScreen style={styles.container}>
      <Header
        title="AI 전화 설정"
        onBackPress={() => navigation.goBack()}
        marginBottom={40}
      />
      <TimePicker value={parseTimeToDate(time)} onChange={handleTimeChange} />
      <RepeatDaysCard selectedDays={selectedDays} onToggleDay={toggleDay} />
      <View style={styles.optionsContainer}>
        <OptionItem
          icon={
            <VibrateIcon
              width={24}
              height={24}
              color={vibrate.enabled ? '#000' : '#888'}
            />
          }
          label="진동"
          subLabel={vibrate.value}
          toggled={vibrate.enabled}
          onPress={() =>
            navigation.navigate('SelectVibrate', {vibrate: vibrate.value})
          }
          onToggle={toggleVibrate}
          hasToggle
        />
        <OptionItem
          icon={
            <CallIcon
              width={24}
              height={24}
              color={callBack.enabled ? '#000' : '#888'}
            />
          }
          label="다시 전화"
          subLabel={callBack.value}
          toggled={callBack.enabled}
          onPress={() =>
            navigation.navigate('SelectCallBack', {callBack: callBack.value})
          }
          onToggle={toggleCallBack}
          hasToggle
        />
        <OptionItem
          icon={<VoiceIcon width={24} height={24} color={'#000'} />}
          label="AI 음성"
          subLabel={voice}
          onPress={() => navigation.navigate('SelectVoice', {voice})}
        />
      </View>
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
