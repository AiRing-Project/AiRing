import {useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import IcChevronLeft from '../../../assets/icons/ic-chevron-left.svg';
import IcEmotionEmpty from '../../../assets/icons/ic-emotion-empty.svg';
import EmotionIcon from '../../../components/common/EmotionIcon';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import MonthYearPicker from '../../../components/picker/MonthYearPicker';
import {useAuthStore} from '../../../store/authStore';
import {getDateString, isFuture} from '../../../utils/date';

// 한글 요일/월 설정
LocaleConfig.locales.ko = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

// TODO: 서버 연동 후 삭제
const diaryData = [
  {
    date: '2025-05-01',
    id: 101,
    title: '출장 준비',
    emotion: ['anticipation', 'joy'],
    tag: ['work', 'trip'],
    hasReply: true,
  },
  {
    date: '2025-05-02',
    id: 106,
    title: '아침 산책',
    emotion: ['calm'],
    tag: ['health', 'morning'],
    hasReply: false,
  },
  {
    date: '2025-05-03',
    id: 102,
    title: '점심 데이트',
    emotion: ['joy'],
    tag: ['food', 'friend'],
    hasReply: false,
  },
  {
    date: '2025-05-04',
    id: 107,
    title: '가족 모임',
    emotion: ['thoughtful', 'joy'],
    tag: ['family'],
    hasReply: true,
  },
  {
    date: '2025-05-05',
    id: 108,
    title: '어린이날',
    emotion: ['joy'],
    tag: ['holiday', 'family'],
    hasReply: false,
  },
  {
    date: '2025-05-07',
    id: 103,
    title: '책 읽기',
    emotion: ['calm', 'thoughtful'],
    tag: ['hobby'],
    hasReply: true,
  },
  {
    date: '2025-05-10',
    id: 109,
    title: '운동 후 피곤함',
    emotion: ['tired'],
    tag: ['health', 'exercise'],
    hasReply: false,
  },
  {
    date: '2025-05-12',
    id: 110,
    title: '업무 스트레스',
    emotion: ['anger', 'thoughtful'],
    tag: ['work', 'stress'],
    hasReply: false,
  },
  {
    date: '2025-05-15',
    id: 111,
    title: '친구와 갈등',
    emotion: ['anger'],
    tag: ['friend', 'conflict'],
    hasReply: true,
  },
  {
    date: '2025-05-18',
    id: 112,
    title: '카페에서 휴식',
    emotion: ['calm'],
    tag: ['cafe', 'rest'],
    hasReply: false,
  },
  {
    date: '2025-05-20',
    id: 113,
    title: '새로운 취미 시작',
    emotion: ['anticipation'],
    tag: ['hobby', 'new'],
    hasReply: true,
  },
  {
    date: '2025-05-22',
    id: 114,
    title: '비 오는 날',
    emotion: ['thoughtful'],
    tag: ['weather', 'rain'],
    hasReply: false,
  },
  {
    date: '2025-05-25',
    id: 115,
    title: '맛집 탐방',
    emotion: ['joy'],
    tag: ['food', 'trip'],
    hasReply: true,
  },
  {
    date: '2025-05-28',
    id: 116,
    title: '야근',
    emotion: ['anger', 'tired'],
    tag: ['work', 'night'],
    hasReply: false,
  },
  {
    date: '2025-05-30',
    id: 117,
    title: '산책하며 생각 정리',
    emotion: ['thoughtful', 'calm'],
    tag: ['health', 'walk'],
    hasReply: true,
  },
  // 6월 데이터 예시
  {
    date: '2025-06-02',
    id: 104,
    title: '생각이 많은 날',
    emotion: ['thoughtful'],
    tag: ['stress', 'tired'],
    hasReply: false,
  },
  {
    date: '2025-06-03',
    id: 105,
    title: '오늘 일기',
    emotion: ['anger'],
    tag: ['stress', 'tired'],
    hasReply: false,
  },
];

// 감정별 색상 매핑(임의 지정)
const emotionColorMap: Record<string, string> = {
  joy: '#FFD600', // 노랑
  calm: '#3A7BFF', // 파랑
  anticipation: '#7ED957', // 연두
  thoughtful: '#A259FF', // 보라
  anger: '#ff6d6d', // 빨강
};

const DAY_BOX_SIZE = 35;

const CalendarScreen = () => {
  const todayString = getDateString();
  const [selected, setSelected] = useState<string | null>(todayString);
  const [current, setCurrent] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const {user} = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      setSelected(getDateString());
      setCurrent(new Date());
    }, []),
  );

  const handleDayPress = (day: any) => {
    if (isFuture(day.dateString)) {
      return;
    } // 미래 날짜는 선택 불가
    setSelected(day.dateString);
  };

  const updateMonthAndSelected = (year: number, month: number) => {
    setCurrent(new Date(year, month - 1, 1));
    setSelected(null); // 월 변경 시 아무 날짜도 선택하지 않음
  };

  const handleMonthChange = (month: {year: number; month: number}) => {
    updateMonthAndSelected(month.year, month.month);
  };

  const handleMonthPickerChange = (_event: any, newDate?: Date) => {
    setShowMonthPicker(false);
    if (newDate) {
      updateMonthAndSelected(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  // 선택된 날짜의 일기 데이터
  const diary = selected ? diaryData.find(d => d.date === selected) : undefined;

  const handleGoToDiaryDetail = (id: number) => {
    console.log('상세', id);
  };
  const handleGoToDiaryWrite = (date: string) => {
    console.log('작성', date);
  };

  const renderDay = ({date, state, marking: _marking}: any) => {
    const isToday = date.dateString === todayString;
    const isSelected = selected ? date.dateString === selected : false;
    // 해당 날짜의 일기 데이터
    const selectedDiary = diaryData.find(d => d.date === date.dateString);
    // 감정 색상(여러 감정이면 첫 번째만 적용)
    const emotionColor =
      selectedDiary && selectedDiary.emotion.length > 0
        ? emotionColorMap[selectedDiary.emotion[0]]
        : undefined;
    const boxStyle = [
      styles.dayBox,
      isToday && styles.dayBoxSelected,
      state === 'disabled' && styles.dayBoxDisabled,
    ].filter(Boolean);
    const textStyle = [
      styles.dayText,
      isToday && styles.dayTextSelected,
      isSelected && styles.dayTextToday,
      state === 'disabled' && styles.dayTextDisabled,
    ].filter(Boolean);
    const showCircle = isSelected;
    return (
      <TouchableOpacity
        style={styles.dayCell}
        activeOpacity={0.7}
        disabled={state === 'disabled'}
        onPress={() => handleDayPress({dateString: date.dateString})}>
        <View style={styles.dayNumberWrap}>
          {showCircle && <View style={styles.dayCircle} />}
          <Text style={textStyle}>{date.day}</Text>
        </View>
        {emotionColor ? (
          <EmotionIcon
            size={DAY_BOX_SIZE}
            colors={[emotionColor, emotionColor]}
          />
        ) : (
          <View style={boxStyle} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AppScreen isTabScreen scrollable style={styles.container}>
      <View style={styles.topRow}>
        <MonthYearPicker
          value={current}
          onChange={handleMonthPickerChange}
          show={showMonthPicker}
          setShow={setShowMonthPicker}
          minimumDate={new Date(2020, 0)}
          textStyle={styles.dropdownText}
        />
      </View>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{gap: 24}}>
        <Calendar
          key={current.toISOString()}
          current={current.toISOString().split('T')[0]}
          onMonthChange={handleMonthChange}
          markingType="custom"
          dayComponent={props => renderDay(props)}
          renderHeader={() => null}
          hideArrows={true}
          hideDayNames={false}
          theme={
            {
              textSectionTitleColor: '#000',
              'stylesheet.calendar.header': {
                dayTextAtIndex0: {color: '#FF5A5A'},
                dayTextAtIndex6: {color: '#3A7BFF'},
              },
            } as any
          }
          hideExtraDays={false}
          firstDay={0}
          enableSwipeMonths={true}
        />
        {/* 선택된 날짜에 따라 일기 카드/버튼 노출 */}
        {selected &&
          !isFuture(selected) &&
          (diary ? (
            <TouchableOpacity
              style={styles.diaryCard}
              activeOpacity={0.8}
              onPress={() => handleGoToDiaryDetail(diary.id)}>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <View style={{flex: 1}}>
                <Text style={styles.diaryTitle}>{diary.title}</Text>
                <View style={styles.diaryRow}>
                  <Text style={styles.diaryLabel}>감정: </Text>
                  <Text style={styles.diaryValue}>
                    {diary.emotion.join(', ')}
                  </Text>
                </View>
                <View style={styles.diaryRow}>
                  <Text style={styles.diaryLabel}>태그: </Text>
                  <Text style={styles.diaryValue}>{diary.tag.join(', ')}</Text>
                </View>
                <View style={styles.diaryRow}>
                  <Text style={styles.diaryLabel}>답장: </Text>
                  <Text style={styles.diaryValue}>
                    {diary.hasReply ? 'O' : 'X'}
                  </Text>
                </View>
              </View>
              <IcChevronLeft style={styles.goDiaryIcon} />
            </TouchableOpacity>
          ) : (
            <ListItem
              containerStyle={styles.diaryWriteBtn}
              leftIcon={<IcEmotionEmpty width={45} height={45} />}
              label={
                <View style={styles.diaryWriteTextWrap}>
                  <Text
                    style={[
                      styles.diaryWriteText,
                      // eslint-disable-next-line react-native/no-inline-styles
                      {textAlign: 'right', flexShrink: 1},
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {user.username}
                  </Text>
                  {/* eslint-disable-next-line react-native/no-inline-styles */}
                  <Text style={[styles.diaryWriteText, {textAlign: 'left'}]}>
                    님의 하루, 일기로 정리해볼까요?
                  </Text>
                </View>
              }
              onPress={() => handleGoToDiaryWrite(selected)}
            />
          ))}

        <HorizontalDivider />

        {/* 최근 통화 요약 */}
        <View style={styles.recentCallSummary}>
          <Text style={styles.recentCallSummaryTitle}>최근 통화 요약</Text>
          <ListItem
            containerStyle={styles.recentCallListItem}
            label={
              <Text style={styles.recentCallListItemLabel}>
                친구와의 오해 그리고 다툼
              </Text>
            }
            rightIcon={<IcEmotionEmpty width={45} height={45} />}
          />
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 20,
    letterSpacing: 0.2,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  dayBox: {
    width: DAY_BOX_SIZE,
    height: DAY_BOX_SIZE,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.11)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  dayBoxSelected: {
    width: DAY_BOX_SIZE,
    height: DAY_BOX_SIZE,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.11)',
    borderColor: '#222',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  dayBoxDisabled: {
    backgroundColor: '#F2F2F2',
  },
  dayText: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
  },
  dayTextSelected: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000',
    alignItems: 'center',
    display: 'flex',
  },
  dayTextDisabled: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#C9CACC',
    display: 'flex',
    alignItems: 'center',
  },
  dayTextToday: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: '#fff',
    alignItems: 'center',
    display: 'flex',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    gap: 4,
  },
  dayCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#000',
    zIndex: 0,
  },
  dayNumberWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goDiaryIcon: {
    transform: [{scaleX: -1}],
    color: 'rgba(0, 0, 0, 0.5)',
  },
  diaryCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 25,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 8,
  },
  diaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  diaryLabel: {
    fontSize: 14,
    color: '#2b2b2b',
    fontWeight: '500',
  },
  diaryValue: {
    fontSize: 14,
    color: '#2b2b2b',
    fontWeight: '700',
    marginLeft: 4,
  },
  diaryWriteBtn: {
    height: 80,
    paddingVertical: 16,
    paddingHorizontal: 25,
  },
  diaryWriteTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  diaryWriteText: {
    fontSize: 12,
    letterSpacing: -0.1,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  recentCallSummary: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 25,
    paddingBottom: 20,
    height: 164,
    gap: 18,
  },
  recentCallSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  recentCallListItem: {
    backgroundColor: '#eee',
    padding: 16,
    height: 80,
  },
  recentCallListItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
  },
});

export default CalendarScreen;
