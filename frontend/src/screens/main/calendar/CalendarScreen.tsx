import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MonthYearPicker from '../../../components/MonthYearPicker';
import {getTodayString, isDateInCurrentMonth} from '../../../utils/date';

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

const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const todayString = getTodayString();
  const [selected, setSelected] = useState<string>(todayString);
  const [current, setCurrent] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);

  // 날짜 클릭 시
  const handleDayPress = (day: any) => {
    setSelected(day.dateString);
  };

  // 월 변경 및 선택된 날짜 유효성 체크 공통 함수
  const updateMonthAndSelected = (year: number, month: number) => {
    setCurrent(new Date(year, month - 1, 1));
    if (!isDateInCurrentMonth(selected, year, month)) {
      setSelected('');
    }
  };

  // 월 변경 시, 선택된 날짜가 해당 월에 없으면 선택 해제
  const handleMonthChange = (month: {year: number; month: number}) => {
    updateMonthAndSelected(month.year, month.month);
  };

  // MonthPicker에서 월/연도 선택 핸들러
  const handleMonthPickerChange = (_event: any, newDate?: Date) => {
    setShowMonthPicker(false);
    if (newDate) {
      updateMonthAndSelected(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  const renderDay = ({date, state, marking: _marking}: any) => {
    const isToday = date.dateString === todayString;
    const isSelected = date.dateString === selected;
    const boxStyle = [
      styles.dayBox,
      isSelected && styles.dayBoxSelected,
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
    marginBottom: 35,
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
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  dayBoxSelected: {
    width: 36,
    height: 35,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: '#222',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
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
});

export default CalendarScreen;
