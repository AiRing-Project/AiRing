import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import BackspaceIcon from '../../assets/icons/ic-backspace.svg';

interface NumPadProps {
  onPress: (num: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const NumPad = ({onPress, onBackspace, disabled}: NumPadProps) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '<'],
  ];

  return (
    <View style={styles.numpadWrap}>
      {numbers.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.numpadRow}>
          {row.map((item, colIdx) => {
            if (item === '') {
              return <View key={colIdx} style={styles.numpadButton} />;
            }
            if (item === '<') {
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={styles.numpadButton}
                  onPress={onBackspace}
                  disabled={disabled}>
                  <BackspaceIcon width={32} height={32} color={'#888'} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={colIdx}
                style={styles.numpadButton}
                onPress={() => onPress(item)}
                disabled={disabled}>
                <Text style={styles.numpadButtonText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  numpadWrap: {
    marginTop: 'auto',
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadRow: {
    flexDirection: 'row',
    width: '100%',
  },
  numpadButton: {
    flex: 1,
    aspectRatio: 1.6,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadButtonText: {
    fontSize: 28,
    color: '#0a0a05',
    fontWeight: '500',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
});

export default NumPad;
