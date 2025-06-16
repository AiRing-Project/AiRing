import React, {useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import IcChevronDown from '../../assets/icons/ic-chevron-down.svg';

interface PickerProps {
  value: string;
  onChange: (value: string) => void;
  data: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  dropdownStyle?: ViewStyle;
  dropdownItemStyle?: ViewStyle;
  dropdownItemTextStyle?: TextStyle;
}

const Picker: React.FC<PickerProps> = ({
  value,
  onChange,
  data: list,
  style,
  textStyle,
  dropdownStyle,
  dropdownItemStyle,
  dropdownItemTextStyle,
}) => {
  const [show, setShow] = useState(false);

  const handleSelect = (item: string) => {
    onChange(item);
    setShow(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => setShow(prev => !prev)}>
        <Text style={[styles.selectedText, textStyle]}>{value}</Text>
        <IcChevronDown style={styles.dropdownIcon} />
      </TouchableOpacity>
      {show && (
        <View style={[styles.dropdown, dropdownStyle]}>
          <FlatList
            data={list}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({item, index}) => (
              <>
                <TouchableOpacity
                  style={dropdownItemStyle}
                  onPress={() => handleSelect(item)}>
                  <Text
                    style={[
                      item === value ? styles.activeText : styles.inactiveText,
                      dropdownItemTextStyle,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
                {index < list.length - 1 && <View style={styles.divider} />}
              </>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  dropdownIcon: {
    width: 9,
    height: 5,
    marginTop: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '10%',
    width: '80%',
    zIndex: 100,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 17.2,
    elevation: 17.2,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#232323',
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginVertical: 20,
  },
});

export default Picker;
