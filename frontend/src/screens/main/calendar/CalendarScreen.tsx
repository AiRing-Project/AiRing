import {useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import IcChevronLeft from '../../../assets/icons/ic-chevron-left.svg';
import HorizontalDivider from '../../../components/HorizontalDivider';
import MonthYearPicker from '../../../components/MonthYearPicker';
import {
  getDateString,
  isDateInCurrentMonth,
  isFuture,
} from '../../../utils/date';

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
    date: '2025-05-03',
    id: 102,
    title: '점심 데이트',
    emotion: ['joy'],
    tag: ['food', 'friend'],
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
    date: '2025-06-02',
    id: 104,
    title: '생각이 많은 날',
    emotion: ['thoughtful'],
    tag: ['stress', 'tired'],
    hasReply: false,
  },
  {
    date: '2025-06-03',
    id: 104,
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

const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const todayString = getDateString();
  const [selected, setSelected] = useState<string>(todayString);
  const [current, setCurrent] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      setSelected(getDateString());
      setCurrent(new Date());
    }, []),
  );

  const handleDayPress = (day: any) => {
    setSelected(day.dateString);
  };

  const updateMonthAndSelected = (year: number, month: number) => {
    setCurrent(new Date(year, month - 1, 1));
    if (!isDateInCurrentMonth(selected, year, month)) {
      setSelected('');
    }
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
  const diary = diaryData.find(d => d.date === selected);

  const handleGoToDiaryDetail = (id: number) => {
    console.log('상세', id);
  };
  const handleGoToDiaryWrite = (date: string) => {
    console.log('작성', date);
  };

  const renderDay = ({date, state, marking: _marking}: any) => {
    const isToday = date.dateString === todayString;
    const isSelected = date.dateString === selected;
    // 해당 날짜의 일기 데이터
    const diary = diaryData.find(d => d.date === date.dateString);
    // 감정 색상(여러 감정이면 첫 번째만 적용)
    const emotionColor =
      diary && diary.emotion.length > 0
        ? emotionColorMap[diary.emotion[0]]
        : undefined;
    const boxStyle = [
      styles.dayBox,
      isSelected && styles.dayBoxSelected,
      state === 'disabled' && styles.dayBoxDisabled,
      emotionColor && {backgroundColor: emotionColor},
    ].filter(Boolean);
    const textStyle = [
      styles.dayText,
      isSelected && styles.dayTextSelected,
      isToday && styles.dayTextToday,
      state === 'disabled' && styles.dayTextDisabled,
    ].filter(Boolean);
    const showCircle = isToday;
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
        <View style={boxStyle} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
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
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <HorizontalDivider style={{marginVertical: 25}} />

      {/* 선택된 날짜에 따라 일기 카드/버튼 노출 */}
      {!isFuture(selected) &&
        (diary ? (
          <TouchableOpacity
            style={styles.diaryCard}
            activeOpacity={0.8}
            onPress={() => handleGoToDiaryDetail(diary.id)}>
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
          <TouchableOpacity
            style={styles.diaryWriteBtn}
            activeOpacity={0.8}
            onPress={() => handleGoToDiaryWrite(selected)}>
            <Text style={styles.diaryWriteText}>일기 쓰러가기</Text>
            <IcChevronLeft style={styles.goDiaryIcon} />
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 20,
    letterSpacing: 0.2,
    fontWeight: '700',
    fontFamily: 'Pretendard',
    color: '#000',
    marginLeft: 12,
  },
  dayBox: {
    width: 36,
    height: 35,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.11)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  dayBoxSelected: {
    width: 36,
    height: 35,
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
    fontFamily: 'Pretendard',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
  },
  dayTextSelected: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#000',
    alignItems: 'center',
    display: 'flex',
  },
  dayTextDisabled: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#C9CACC',
    display: 'flex',
    alignItems: 'center',
  },
  dayTextToday: {
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
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
    fontFamily: 'Pretendard',
  },
  diaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  diaryLabel: {
    fontSize: 14,
    color: '#2b2b2b',
    fontFamily: 'Pretendard',
    fontWeight: '500',
  },
  diaryValue: {
    fontSize: 14,
    color: '#2b2b2b',
    fontFamily: 'Pretendard',
    fontWeight: '700',
    marginLeft: 4,
  },
  diaryWriteBtn: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 25,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diaryWriteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232323',
    fontFamily: 'Pretendard',
  },
});

export default CalendarScreen;
