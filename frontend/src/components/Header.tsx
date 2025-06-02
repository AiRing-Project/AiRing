import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import IcChevronLeft from '../assets/icons/ic-chevron-left.svg';

interface HeaderProps {
  title: string;
  onBackPress: () => void;
  marginBottom?: number;
}

const Header = ({title, onBackPress, marginBottom = 0}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, {marginTop: insets.top, marginBottom}]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
        <IcChevronLeft width={24} height={24} />
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
    fontSize: 18,
    letterSpacing: 0.2,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Pretendard',
    lineHeight: 20,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  textFlexBox: {
    textAlign: 'center',
    fontFamily: 'Pretendard',
    lineHeight: 20,
    alignSelf: 'stretch',
  },
});

export default Header;
