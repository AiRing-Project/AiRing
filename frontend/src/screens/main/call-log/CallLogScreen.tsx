import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MonthPicker from 'react-native-month-year-picker';
import {SvgProps} from 'react-native-svg';

import {RootStackParamList} from '../../../../App';
import IcChevronDown from '../../../assets/icons/ic-chevron-down.svg';
import IcChevronRight from '../../../assets/icons/ic-chevron-right.svg';
import InfoCircle from '../../../assets/icons/ic-info-circle.svg';
import PhoneDeclined from '../../../assets/icons/ic-phone-declined.svg';
import PhoneIncoming from '../../../assets/icons/ic-phone-incoming.svg';
import PhoneOutgoing from '../../../assets/icons/ic-phone-outgoing.svg';
import IcSearch from '../../../assets/icons/ic-search.svg';
import {formatSectionDate, formatTime} from '../../../utils/date';

// TODO: 통화 거절도 기록을 할 필요가 있을지 추가 논의 필요
type CallType = 'incoming' | 'outgoing' | 'declined';

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
        callType: 'declined',
        summary: '통화 거절',
      },
    ],
  },
];

const iconMap: Record<CallType, React.FC<SvgProps>> = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
  declined: PhoneDeclined,
};

const SectionDate: React.FC<{date: string}> = ({date}) => (
  <Text style={styles.sectionDate}>{date}</Text>
);

const CallLogScreen = () => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.7}
          onPress={() => setShowMonthPicker(true)}>
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownText}>
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </Text>
            <IcChevronDown width={9} height={5} style={styles.dropdownIcon} />
          </View>
        </TouchableOpacity>
        {showMonthPicker && (
          <MonthPicker
            onChange={handleMonthChange}
            value={selectedDate}
            minimumDate={new Date(2020, 0)} // TODO: 추후 가입일 또는 서비스 오픈일로 설정
            maximumDate={new Date()}
            locale="ko"
            mode="short"
            okButton="확인"
            cancelButton="취소"
          />
        )}
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
          <View key={section.date} style={styles.section}>
            <SectionDate date={formatSectionDate(section.date)} />
            <View style={styles.logRows}>
              {section.logs.map(log => {
                const IconComponent = iconMap[log.callType];
                return (
                  <TouchableOpacity
                    key={log.id}
                    style={styles.logRow}
                    onPress={() =>
                      navigation.navigate('CallLogDetailScreen', {id: log.id})
                    }
                    activeOpacity={0.7}>
                    <IconComponent width={24} height={24} />
                    <View style={styles.logInfo}>
                      <Text
                        style={styles.name}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {log.summary}
                      </Text>
                      <Text style={styles.time}>
                        {formatTime(log.startedAt)}
                      </Text>
                    </View>
                    <IcChevronRight
                      width={8}
                      height={15}
                      style={styles.arrow}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    fontWeight: '700',
    color: '#232323',
    marginLeft: 12,
  },
  searchBtn: {
    padding: 4,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    height: 65,
    paddingHorizontal: 31,
    paddingVertical: 22,
    marginBottom: 24,
    gap: 12,
  },
  noticeIcon: {
    borderRadius: 2,
  },
  noticeText: {
    fontSize: 14,
    color: '#2b2b2b',
    textAlign: 'center',
    fontFamily: 'Pretendard',
    fontWeight: '500',
  },
  noticeTime: {
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  scrollContent: {
    paddingBottom: 32,
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
    fontFamily: 'Pretendard',
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
    fontFamily: 'Pretendard',
    lineHeight: 20,
    textAlign: 'left',
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aeaeae',
    fontFamily: 'Pretendard',
    lineHeight: 20,
    textAlign: 'left',
    flexShrink: 1,
  },
  arrow: {
    // marginLeft 제거 (gap과 paddingRight로 대체)
  },
  dropdownIcon: {
    marginTop: 4,
  },
});

export default CallLogScreen;
