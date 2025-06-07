import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import IcChevronRight from '../../assets/icons/ic-chevron-right.svg';

interface ListItemProps {
  label: string | React.ReactNode;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

const ListItem = ({
  label,
  leftIcon,
  onPress,
  containerStyle,
  labelStyle,
  rightIcon,
  disabled = false,
}: ListItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {typeof label === 'string' ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : (
        label
      )}
      <View style={styles.rightIcon}>
        {rightIcon ? rightIcon : <IcChevronRight width={16} height={16} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    justifyContent: 'space-between',
  },
  leftIcon: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
    flex: 1,
  },
  rightIcon: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListItem;
