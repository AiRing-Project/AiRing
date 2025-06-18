import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import {RootStackParamList} from '../../../../App';
import EmotionIcon from '../../../components/common/EmotionIcon';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import ListItem from '../../../components/common/ListItem';
import ReplyModal from '../../../components/common/ReplyModal';
import AppScreen from '../../../components/layout/AppScreen';
import MonthYearPicker from '../../../components/picker/MonthYearPicker';
import {
  CALENDAR_HEADER_DAYS_LONG,
  CALENDAR_HEADER_DAYS_SHORT,
  MONTHS,
} from '../../../constants/calendar';
import {EMOTION_COLOR_MAP} from '../../../constants/emotion';
import {useAuthStore} from '../../../store/authStore';
import useDiaryStore from '../../../store/diaryStore';
import {Emotion} from '../../../types/emotion';
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

const DAY_BOX_SIZE = 35;

const CalendarScreen = () => {
  const todayString = getDateString();
  const [selected, setSelected] = useState<string | null>(todayString);
  const [current, setCurrent] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);
  const {user} = useAuthStore();
  const {diaries, getDiaries} = useDiaryStore();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 화면 포커스 시 데이터 로드
  useFocusEffect(
    useCallback(() => {
      setSelected(getDateString());
      setCurrent(new Date());
      getDiaries();
    }, [getDiaries]),
  );

  const handleDayPress = (day: any) => {
    if (isFuture(day.dateString)) {
      return;
    } // 미래 날짜는 선택 불가
    setSelected(day.dateString);
  };

  const updateMonthAndSelected = (year: number, month: number) => {
    setCurrent(new Date(year, month - 1, 10));
    setSelected(null);
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
  const diary = selected ? diaries.find(d => d.date === selected) : undefined;

  const handleGoToDiaryDetail = (id: string) => {
    navigation.navigate('Diary', {id, mode: 'read'});
  };

  const handleGoToDiaryWrite = (date: string) => {
    navigation.navigate('Diary', {mode: 'edit', date});
  };

  // CalendarScreen 컴포넌트 내부, render 바로 위쯤
  console.log(
    '🏷️ current state:',
    current,
    '→ toISOString():',
    current.toISOString().split('T')[0],
  );

  const renderDay = ({date, state, marking: _marking}: any) => {
    const isToday = date.dateString === todayString;
    const isSelected = selected ? date.dateString === selected : false;
    // 해당 날짜의 일기 데이터
    const selectedDiary = diaries.find(d => d.date === date.dateString);
    // 감정 색상(여러 감정이면 첫 번째만 적용)
    const emotionColor =
      selectedDiary && selectedDiary.emotion.length > 0
        ? EMOTION_COLOR_MAP[selectedDiary.emotion[0] as Emotion]
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
                colors={EMOTION_COLOR_MAP[diary.emotion[0] as Emotion]}
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
                    setShowReplyModal(true);
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
      <ReplyModal
        visible={showReplyModal}
        onClose={() => setShowReplyModal(false)}
      />
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
