import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';

interface ToggleButtonProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

const WIDTH = 52;
const HEIGHT = 24;
const PADDING = 4;
const HANDLE_SIZE = 16;
const ACTIVE_COLOR = '#232323';
const INACTIVE_COLOR = '#AAAAAA';
const HANDLE_COLOR = '#FFF';

const Switch: React.FC<ToggleButtonProps> = ({
  value,
  onValueChange,
  disabled,
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_COLOR, ACTIVE_COLOR],
  });

  const handleTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, WIDTH - HANDLE_SIZE - PADDING],
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={({pressed}) => [
        {opacity: disabled ? 0.5 : pressed ? 0.7 : 1},
        styles.wrapper,
      ]}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}>
      <Animated.View style={[styles.track, {backgroundColor}]} />
      <View
        style={[
          styles.labelContainer,
          value ? {paddingRight: HANDLE_SIZE} : {paddingLeft: HANDLE_SIZE},
        ]}
        pointerEvents="none">
        <Text style={styles.toggleLabel}>{value ? 'on' : 'off'}</Text>
      </View>
      <Animated.View
        style={[
          styles.handle,
          {
            transform: [{translateX: handleTranslate}],
            shadowOpacity: value ? 0.18 : 0.08,
            top: (HEIGHT - HANDLE_SIZE) / 2,
          },
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: WIDTH,
    height: HEIGHT,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
  },
  handle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: HANDLE_COLOR,
    position: 'absolute',
    top: (HEIGHT - HANDLE_SIZE) / 2,
    left: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  labelContainer: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f6f6f6',
    textTransform: 'uppercase',
  },
});

export default Switch;
