import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import {RootStackParamList} from '../../../../App';
import EmotionIcon from '../../../components/common/EmotionIcon';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import ListItem from '../../../components/common/ListItem';
import AppScreen from '../../../components/layout/AppScreen';
import MonthYearPicker from '../../../components/picker/MonthYearPicker';
import {
  CALENDAR_HEADER_DAYS_LONG,
  CALENDAR_HEADER_DAYS_SHORT,
  MONTHS,
} from '../../../constants/calendar';
import {EMOTION_COLOR_MAP} from '../../../constants/emotion';
import {useAuthStore} from '../../../store/authStore';
import {getDateString, isFuture} from '../../../utils/date';

// 한글 요일/월 설정
LocaleConfig.locales.ko = {
  monthNames: MONTHS,
  monthNamesShort: MONTHS,
  dayNames: CALENDAR_HEADER_DAYS_LONG,
  dayNamesShort: CALENDAR_HEADER_DAYS_SHORT,
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

// TODO: 서버 연동 후 삭제
const diaryData = [
  {
    date: '2025-05-01',
    id: 101,
    title: '출장 준비',
    emotion: ['흥분', '자신하는'],
    tag: ['work', 'trip'],
    hasReply: true,
  },
  {
    date: '2025-05-02',
    id: 106,
    title: '아침 산책',
    emotion: ['편안한', '자신하는'],
    tag: ['health', 'morning'],
    hasReply: true,
  },
  {
    date: '2025-05-03',
    id: 102,
    title: '점심 데이트',
    emotion: ['만족스러운', '기쁜'],
    tag: ['food', 'friend'],
    hasReply: true,
  },
  {
    date: '2025-05-04',
    id: 107,
    title: '가족 모임',
    emotion: ['감사하는', '편안한'],
    tag: ['family'],
    hasReply: true,
  },
  {
    date: '2025-05-05',
    id: 108,
    title: '어린이날',
    emotion: ['기쁜', '만족스러운'],
    tag: ['holiday', 'family'],
    hasReply: true,
  },
  {
    date: '2025-05-07',
    id: 103,
    title: '책 읽기',
    emotion: ['편안한', '자신하는'],
    tag: ['hobby'],
    hasReply: true,
  },
  {
    date: '2025-05-10',
    id: 109,
    title: '운동 후 피곤함',
    emotion: ['불안', '우울한'],
    tag: ['health', 'exercise'],
    hasReply: true,
  },
  {
    date: '2025-05-12',
    id: 110,
    title: '업무 스트레스',
    emotion: ['스트레스 받는', '분노'],
    tag: ['work', 'stress'],
    hasReply: true,
  },
  {
    date: '2025-05-15',
    id: 111,
    title: '친구와 갈등',
    emotion: ['당황', '스트레스 받는'],
    tag: ['friend', 'conflict'],
    hasReply: true,
  },
  {
    date: '2025-05-18',
    id: 112,
    title: '카페에서 휴식',
    emotion: ['편안한', '자신하는'],
    tag: ['cafe', 'rest'],
    hasReply: true,
  },
  {
    date: '2025-05-20',
    id: 113,
    title: '새로운 취미 시작',
    emotion: ['자신하는', '흥분'],
    tag: ['hobby', 'new'],
    hasReply: true,
  },
  {
    date: '2025-05-22',
    id: 114,
    title: '비 오는 날',
    emotion: ['우울한', '불안'],
    tag: ['weather', 'rain'],
    hasReply: true,
  },
  {
    date: '2025-05-25',
    id: 115,
    title: '맛집 탐방',
    emotion: ['기쁜', '만족스러운'],
    tag: ['food', 'trip'],
    hasReply: true,
  },
  {
    date: '2025-05-28',
    id: 116,
    title: '야근',
    emotion: ['슬픔', '스트레스 받는'],
    tag: ['work', 'night'],
    hasReply: true,
  },
  {
    date: '2025-05-30',
    id: 117,
    title: '산책하며 생각 정리',
    emotion: ['자신하는', '편안한'],
    tag: ['health', 'walk'],
    hasReply: true,
  },
  // 6월 데이터 예시
  {
    date: '2025-06-02',
    id: 104,
    title: '생각이 많은 날',
    emotion: ['외로운', '우울한'],
    tag: ['stress', 'tired'],
    hasReply: true,
  },
  {
    date: '2025-06-03',
    id: 105,
    title: '오늘 일기',
    emotion: ['분노', '스트레스 받는'],
    tag: ['stress', 'tired'],
    hasReply: true,
  },
  {
    date: '2025-06-05',
    id: 199,
    title: '오늘 일기',
    emotion: ['그저 그런'],
    tag: ['fine'],
    hasReply: true,
  },
  {
    date: '2025-06-07',
    id: 200,
    title: '오늘 일기',
    emotion: ['흥분'],
    tag: ['happy'],
    hasReply: true,
  },
  {
    date: '2025-06-08',
    id: 201,
    title: '테니스 치기',
    emotion: ['기쁜'],
    tag: ['stress'],
    hasReply: true,
  },
  {
    date: '2025-06-10',
    id: 202,
    title: '친구와 한강에서 피크닉',
    emotion: ['편안한'],
    tag: ['relax'],
    hasReply: true,
  },
  {
    date: '2025-06-11',
    id: 203,
    title: '카페에서 공부하기',
    emotion: ['만족스러운'],
    tag: ['study'],
    hasReply: true,
  },
  {
    date: '2025-06-13',
    id: 204,
    title: '친구와 갈등',
    emotion: ['당황'],
    tag: ['friend'],
    hasReply: true,
  },
  {
    date: '2025-06-15',
    id: 205,
    title: '친구와 갈등',
    emotion: ['스트레스 받는'],
    tag: ['friend'],
    hasReply: true,
  },
  {
    date: '2025-06-16',
    id: 206,
    title: '야근',
    emotion: ['우울한'],
    tag: ['work'],
    hasReply: true,
  },
];

const DAY_BOX_SIZE = 35;

const CalendarScreen = () => {
  const todayString = getDateString();
  const [selected, setSelected] = useState<string | null>(todayString);
  const [current, setCurrent] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const {user} = useAuthStore();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
    navigation.navigate('Diary', {id, mode: 'read'});
  };
  const handleGoToDiaryWrite = (date: string) => {
    console.log('작성', date);
    navigation.navigate('Diary', {mode: 'edit'});
  };

  const renderDay = ({date, state, marking: _marking}: any) => {
    const isToday = date.dateString === todayString;
    const isSelected = selected ? date.dateString === selected : false;
    // 해당 날짜의 일기 데이터
    const selectedDiary = diaryData.find(d => d.date === date.dateString);
    // 감정 색상(여러 감정이면 첫 번째만 적용)
    const emotionColor =
      selectedDiary && selectedDiary.emotion.length > 0
        ? EMOTION_COLOR_MAP[selectedDiary.emotion[0]]
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
            colors={emotionColor}
            outlined={isToday}
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
              <EmotionIcon
                size={45}
                colors={EMOTION_COLOR_MAP[diary.emotion[0]]}
              />
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <View style={{flex: 1, gap: 4}}>
                <Text style={styles.diaryTitle}>{diary.title}</Text>
                <Text style={styles.diaryDate}>{diary.date}</Text>
              </View>
              {diary.hasReply && (
                <TouchableOpacity
                  style={styles.seeReplyBtn}
                  activeOpacity={0.8}
                  onPress={e => {
                    e.stopPropagation();
                    // handleGoToDiaryDetail(diary.id); TODO: 답장 보기 페이지로
                  }}>
                  <Text style={styles.seeReplyBtnText}>답장 보기</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ) : (
            <ListItem
              containerStyle={styles.diaryWriteBtn}
              // leftIcon={<IcEmotionEmpty width={45} height={45} />}
              leftIcon={<EmotionIcon size={45} empty />}
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
            rightIcon={<EmotionIcon size={45} empty />}
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
    borderWidth: 2,
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
    height: 80,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 25,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  diaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  diaryDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b4b4b4',
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
  seeReplyBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seeReplyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
  },
});

export default CalendarScreen;
