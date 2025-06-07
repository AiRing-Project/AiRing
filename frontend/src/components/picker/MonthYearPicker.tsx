import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MonthPicker from 'react-native-month-year-picker';

import IcChevronDown from '../../assets/icons/ic-chevron-down.svg';

interface MonthYearPickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  show: boolean;
  setShow: (show: boolean) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  mode?: 'short' | 'full';
  okButton?: string;
  cancelButton?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: ViewStyle;
  dropdownRowStyle?: ViewStyle;
  dropdownTextStyle?: TextStyle;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  show,
  setShow,
  minimumDate,
  maximumDate = new Date(),
  locale = 'ko',
  mode = 'short',
  okButton = '확인',
  cancelButton = '취소',
  style,
  textStyle,
  iconStyle,
  dropdownRowStyle,
  dropdownTextStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.dropdown}
        activeOpacity={0.7}
        onPress={() => setShow(true)}>
        <View style={[styles.dropdownRow, dropdownRowStyle]}>
          <Text style={[styles.dropdownText, textStyle, dropdownTextStyle]}>
            {value.getFullYear()}년 {value.getMonth() + 1}월
          </Text>
          <IcChevronDown style={[styles.dropdownIcon, iconStyle]} />
        </View>
      </TouchableOpacity>
      {show && (
        <MonthPicker
          onChange={onChange}
          value={value}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale={locale}
          mode={mode}
          okButton={okButton}
          cancelButton={cancelButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: '700',
    color: '#232323',
    marginLeft: 12,
  },
  dropdownIcon: {
    width: 9,
    height: 5,
    marginTop: 4,
  },
});

export default MonthYearPicker;
