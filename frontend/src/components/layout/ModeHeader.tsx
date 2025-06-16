import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import IcCancel from '../../assets/icons/ic-cancel.svg';
import IcCheck from '../../assets/icons/ic-check.svg';
import IcChevronLeft from '../../assets/icons/ic-chevron-left.svg';
import IcEdit from '../../assets/icons/ic-edit.svg';
import {HEADER_HEIGHT} from '../../constants/layout';
import {Mode} from '../../types/diary';

interface ModeHeaderProps {
  title: string;
  onBackPress: () => void;
  marginBottom?: number;
  mode: Mode;
  onModeChange?: (mode: Mode) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const ModeHeader = ({
  title,
  marginBottom = 0,
  mode,
  onBackPress,
  onCancel,
  onModeChange,
  onSave,
}: ModeHeaderProps) => {
  const handleLeftPress = () => {
    if (mode === 'edit') {
      onCancel?.();
    } else {
      onBackPress();
    }
  };

  const handleRightPress = () => {
    if (mode === 'read') {
      onModeChange?.('edit');
    } else {
      onSave?.();
    }
  };

  return (
    <View style={[styles.header, {marginBottom}]}>
      <TouchableOpacity style={styles.leftBtn} onPress={handleLeftPress}>
        {mode === 'read' ? (
          <IcChevronLeft color="#000" />
        ) : (
          <IcCancel color="#000" />
        )}
      </TouchableOpacity>
      <Text style={[styles.headerTitle, styles.textFlexBox]}>{title}</Text>
      <TouchableOpacity style={styles.rightBtn} onPress={handleRightPress}>
        {mode === 'read' ? <IcEdit color="#000" /> : <IcCheck color="#000" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: HEADER_HEIGHT,
    marginBottom: 25,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
  },
  leftBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
    padding: 4,
  },
  rightBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  textFlexBox: {
    textAlign: 'center',
    lineHeight: HEADER_HEIGHT,
    alignSelf: 'stretch',
  },
});

export default ModeHeader;
