import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SvgProps} from 'react-native-svg';

import {RootStackParamList} from '../../../../App';
import IcChevronRight from '../../../assets/icons/ic-chevron-right.svg';
import InfoCircle from '../../../assets/icons/ic-info-circle.svg';
import PhoneIncoming from '../../../assets/icons/ic-phone-incoming.svg';
import PhoneOutgoing from '../../../assets/icons/ic-phone-outgoing.svg';
import IcSearch from '../../../assets/icons/ic-search.svg';
import AppScreen from '../../../components/layout/AppScreen';
import MonthYearPicker from '../../../components/picker/MonthYearPicker';
import type {CallType} from '../../../types/call';
import {formatSectionDate, formatTime} from '../../../utils/date';

interface CallLogItem {
  id: number;
  startedAt: string;
  callType: CallType;
  summary: string;
}

interface CallLog {
  date: string;
  logs: CallLogItem[];
}

// TODO: 추후 데이터 연동 후 삭제
const callLogs: CallLog[] = [
  {
    date: '2025-05-14',
    logs: [
      {
        id: 7,
        startedAt: '2025-05-14T21:10:00Z',
        callType: 'incoming',
        summary: '퇴근 후 오늘 하루 돌아보기',
      },
      {
        id: 6,
        startedAt: '2025-05-14T08:30:00Z',
        callType: 'outgoing',
        summary: '아침 인사와 일정 공유',
      },
    ],
  },
  {
    date: '2025-05-13',
    logs: [
      {
        id: 5,
        startedAt: '2025-05-13T20:00:00Z',
        callType: 'incoming',
        summary: '스트레스 해소 대화',
      },
      {
        id: 4,
        startedAt: '2025-05-13T07:45:00Z',
        callType: 'outgoing',
        summary: '오늘 목표 세우기',
      },
    ],
  },
  {
    date: '2025-05-12',
    logs: [
      {
        id: 3,
        startedAt: '2025-05-12T19:30:00Z',
        callType: 'incoming',
        summary: '감정 일기 나누기',
      },
      {
        id: 2,
        startedAt: '2025-05-12T08:00:00Z',
        callType: 'outgoing',
        summary: '기상 및 컨디션 체크',
      },
    ],
  },
  {
    date: '2025-05-11',
    logs: [
      {
        id: 1,
        startedAt: '2025-05-11T21:48:00Z',
        callType: 'outgoing',
        summary: '오늘 하루 대화',
      },
      {
        id: 0,
        startedAt: '2025-05-11T20:30:00Z',
        callType: 'incoming',
        summary: '퇴근길 대화',
      },
    ],
  },
  {
    date: '2025-05-10',
    logs: [
      {
        id: -1,
        startedAt: '2025-05-10T20:00:00Z',
        callType: 'incoming',
        summary: '저녁 대화',
      },
    ],
  },
];

const iconMap: Record<CallType, React.FC<SvgProps>> = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
};

const SectionDate: React.FC<{date: string}> = ({date}) => (
  <Text style={styles.sectionDate}>{date}</Text>
);

interface CallLogSectionProps {
  section: CallLog;
}

const CallLogRow: React.FC<{log: CallLogItem}> = ({log}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const IconComponent = iconMap[log.callType];
  return (
    <TouchableOpacity
      key={log.id}
      style={styles.logRow}
      onPress={() => navigation.navigate('CallLogDetailScreen', {id: log.id})}
      activeOpacity={0.7}>
      <IconComponent width={24} height={24} />
      <View style={styles.logInfo}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {log.summary}
        </Text>
        <Text style={styles.time}>{formatTime(log.startedAt)}</Text>
      </View>
      <IcChevronRight width={16} height={16} />
    </TouchableOpacity>
  );
};

const CallLogSection: React.FC<CallLogSectionProps> = ({section}) => (
  <View key={section.date} style={styles.section}>
    <SectionDate date={formatSectionDate(section.date)} />
    <View style={styles.logRows}>
      {section.logs.map(log => (
        <CallLogRow key={log.id} log={log} />
      ))}
    </View>
  </View>
);

const CallLogScreen = () => {
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(new Date());
    }, []),
  );

  const handleMonthChange = (_event: any, newDate?: Date) => {
    setShowMonthPicker(false);
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  return (
    <AppScreen isTabScreen>
      <View style={styles.topRow}>
        <MonthYearPicker
          value={selectedDate}
          onChange={handleMonthChange}
          show={showMonthPicker}
          setShow={setShowMonthPicker}
          minimumDate={new Date(2020, 0)}
        />
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
          <IcSearch width={19} height={19} />
        </TouchableOpacity>
      </View>
      <View style={styles.noticeBox}>
        <InfoCircle width={20} height={20} style={styles.noticeIcon} />
        <Text style={styles.noticeText}>
          오늘 오후 <Text style={styles.noticeTime}>8시 30분</Text>에 AI 전화가
          예약되어 있어요!
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {callLogs.map(section => (
          <CallLogSection key={section.date} section={section} />
        ))}
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  searchBtn: {
    padding: 4,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3f3f3f',
    borderRadius: 10,
    height: 65,
    paddingHorizontal: 31,
    paddingVertical: 22,
    marginBottom: 40,
    gap: 12,
  },
  noticeIcon: {
    borderRadius: 2,
    color: '#fff',
  },
  noticeText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  noticeTime: {
    fontWeight: '700',
  },
  scrollContent: {
    gap: 36,
  },
  section: {
    gap: 15,
  },
  sectionDate: {
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    width: 83,
    height: 19,
    marginLeft: 12,
    marginBottom: 12,
  },
  logRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 25,
  },
  logRow: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 26,
    gap: 18,
  },
  logInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    fontSize: 14,
    letterSpacing: 0.1,
    fontWeight: '600',
    color: '#111',
    lineHeight: 20,
    textAlign: 'left',
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aeaeae',
    lineHeight: 20,
    textAlign: 'left',
    flexShrink: 1,
  },
});

export default CallLogScreen;
