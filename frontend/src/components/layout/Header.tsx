import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import IcChevronLeft from '../../assets/icons/ic-chevron-left.svg';
import {HEADER_HEIGHT} from '../../constants/layout';

interface HeaderProps {
  title: string;
  onBackPress: () => void;
  marginBottom?: number;
}

const Header = ({title, onBackPress, marginBottom = 0}: HeaderProps) => {
  return (
    <View style={[styles.header, {marginBottom}]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
        <IcChevronLeft color="#000" />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, styles.textFlexBox]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
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
    lineHeight: HEADER_HEIGHT,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  textFlexBox: {
    textAlign: 'center',
    lineHeight: HEADER_HEIGHT,
    alignSelf: 'stretch',
  },
});

export default Header;
