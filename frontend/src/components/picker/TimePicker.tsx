import React from 'react';
import {StyleSheet, View} from 'react-native';

import ScrollPicker from './WheelPicker';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const AMPM = ['오전', '오후'];
const HOURS = Array.from({length: 12}, (_, i) => i + 1); // 1~12
const MINUTES = Array.from({length: 60}, (_, i) => i); // 0~59

const ITEM_HEIGHT = 70;
const VISIBLE_ITEM_COUNT = 3;

// Converts 12-hour format hour and ampm ("오전"/"오후") to 24-hour format hour
function to24HourFormat(hour: number, ampm: string): number {
  if (ampm === '오후') {
    return hour === 12 ? 12 : hour + 12;
  } else {
    return hour === 12 ? 0 : hour;
  }
}

const TimePicker: React.FC<TimePickerProps> = ({value, onChange}) => {
  // Date에서 오전/오후, 시, 분 추출
  const hour24 = value.getHours();
  const ampm = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minute = value.getMinutes();

  const handleAmpmChange = (ampmValue: string) => {
    const newHour = to24HourFormat(hour12, ampmValue);
    const newDate = new Date(value);
    newDate.setHours(newHour);
    onChange(newDate);
  };

  const handleHourChange = (hourValue: number) => {
    const newHour = to24HourFormat(hourValue, ampm);
    const newDate = new Date(value);
    newDate.setHours(newHour);
    onChange(newDate);
  };

  const handleMinuteChange = (minuteValue: number) => {
    const newDate = new Date(value);
    newDate.setMinutes(minuteValue);
    onChange(newDate);
  };

  return (
    <View style={[styles.wrapper, {height: ITEM_HEIGHT * VISIBLE_ITEM_COUNT}]}>
      <View
        style={[
          styles.activeBox,
          {
            height: ITEM_HEIGHT,
            marginTop: -(ITEM_HEIGHT / 2),
          },
        ]}
        pointerEvents="none"
      />
      <View style={styles.container}>
        {/* 오전/오후 wheel */}
        <ScrollPicker
          dataSource={AMPM}
          selectedIndex={AMPM.indexOf(ampm)}
          highlightColor="transparent"
          wrapperBackground="transparent"
          itemTextStyle={styles.ampmText}
          activeItemTextStyle={styles.activeAmpmText}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          onValueChange={item =>
            handleAmpmChange(item as (typeof AMPM)[number])
          }
        />
        {/* 시 wheel */}
        <ScrollPicker
          dataSource={HOURS}
          selectedIndex={HOURS.indexOf(hour12)}
          highlightColor="transparent"
          wrapperBackground="transparent"
          itemTextStyle={styles.numberText}
          activeItemTextStyle={styles.activeNumberText}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          infinite
          onValueChange={item =>
            handleHourChange(item as (typeof HOURS)[number])
          }
        />
        {/* 콜론 */}
        <View style={styles.colonContainer}>
          <View style={styles.colon} />
          <View style={styles.colon} />
        </View>
        {/* 분 wheel */}
        <ScrollPicker
          dataSource={MINUTES}
          selectedIndex={MINUTES.indexOf(minute)}
          highlightColor="transparent"
          wrapperBackground="transparent"
          itemTextStyle={styles.numberText}
          activeItemTextStyle={styles.activeNumberText}
          itemHeight={ITEM_HEIGHT}
          visibleItemCount={VISIBLE_ITEM_COUNT}
          zeroPadLength={2}
          infinite
          onValueChange={item =>
            handleMinuteChange(item as (typeof MINUTES)[number])
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  activeBox: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '100%',
    zIndex: 1,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  colonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  colon: {
    borderRadius: 100,
    backgroundColor: '#888b94',
    width: 6,
    height: 6,
    marginHorizontal: 8,
    alignSelf: 'center',
    zIndex: 2,
  },
  ampmText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e4e4e4',
  },
  activeAmpmText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
  },
  numberText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#e4e4e4',
  },
  activeNumberText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333',
  },
});

export default TimePicker;
