/*
 * ScrollPicker Component
 *
 * Based on: react-native-wheel-scrollview-picker
 * Source: https://github.com/rheng001/react-native-wheel-scrollview-picker
 *
 * Modified by: @do0ori
 * Modified on: 2025-06-07
 *
 * Props:
 *   - visibleItemCount: Number of items visible at once (odd number)
 *   - zeroPadLength: Pads numeric values with leading zeros to this length
 *   - infinite: Enables seamless infinite scrolling
 */
import React, {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

function isNumeric(str: string | unknown): boolean {
  if (typeof str === 'number') {
    return true;
  }
  if (typeof str !== 'string') {
    return false;
  }
  return !isNaN(str as unknown as number) && !isNaN(parseFloat(str));
}

const deviceWidth = Dimensions.get('window').width;

const isViewStyle = (style: ViewProps['style']): style is ViewStyle => {
  return (
    typeof style === 'object' &&
    style !== null &&
    Object.keys(style).includes('height')
  );
};

export type ScrollPickerProps<ItemT extends string | number> = {
  style?: ViewProps['style'];
  dataSource: Array<ItemT>;
  selectedIndex?: number;
  onValueChange?: (value: ItemT | undefined, index: number) => void;
  renderItem?: (
    data: ItemT,
    index: number,
    isSelected: boolean,
  ) => React.ReactNode;
  highlightColor?: string;
  highlightBorderWidth?: number;
  itemTextStyle?: object;
  activeItemTextStyle?: object;
  itemHeight?: number;
  wrapperHeight?: number;
  wrapperBackground?: string;
  visibleItemCount?: number;
  zeroPadLength?: number;
  infinite?: boolean;
  scrollViewComponent?: any;
} & ScrollViewProps;

export type ScrollPickerHandle = {
  scrollToTargetIndex: (val: number) => void;
};

const ScrollPicker = React.forwardRef(
  <ItemT extends string | number>(
    propsState: ScrollPickerProps<ItemT>,
    ref: Ref<ScrollPickerHandle>,
  ): ReactNode => {
    let {
      itemHeight = 30,
      style,
      scrollViewComponent,
      visibleItemCount = 5,
      infinite = false,
      ...props
    } = propsState;

    // Ensure visibleItemCount is always odd
    if (typeof visibleItemCount === 'number') {
      if (visibleItemCount < 1) {
        visibleItemCount = 1;
      }
      if (visibleItemCount % 2 === 0) {
        visibleItemCount -= 1;
      }
    } else {
      visibleItemCount = 5;
    }

    const N = props.dataSource.length;
    // If infinite, repeat the data 3 times for seamless looping
    const dataList = infinite
      ? [...props.dataSource, ...props.dataSource, ...props.dataSource]
      : props.dataSource;

    const [initialized, setInitialized] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(
      props.selectedIndex != null && props.selectedIndex >= 0
        ? props.selectedIndex
        : 0,
    );
    const sView = useRef<ScrollView>(null);
    const [isScrollTo, setIsScrollTo] = useState(false);
    const [dragStarted, setDragStarted] = useState(false);
    const [momentumStarted, setMomentumStarted] = useState(false);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      scrollToTargetIndex: (val: number) => {
        setSelectedIndex(val);
        const targetIndex = infinite ? N + val : val;
        sView.current?.scrollTo({y: targetIndex * itemHeight});
      },
    }));

    const wrapperHeight =
      props.wrapperHeight ||
      (isViewStyle(style) && isNumeric(style.height)
        ? Number(style.height)
        : 0) ||
      itemHeight * visibleItemCount;

    // Set initial scroll position (center block for infinite mode)
    useEffect(() => {
      if (initialized) {
        return;
      }
      setInitialized(true);

      setTimeout(() => {
        const startIdx = infinite ? N + selectedIndex : selectedIndex;
        sView.current?.scrollTo({y: startIdx * itemHeight, animated: false});
      }, 0);

      return () => {
        timer && clearTimeout(timer);
      };
    }, [initialized, N, selectedIndex, itemHeight, infinite, timer]);

    // Render placeholder (header/footer)
    const renderPlaceHolder = () => {
      const h = (wrapperHeight - itemHeight) / 2;
      return {
        header: <View style={{height: h, flex: 1}} />,
        footer: <View style={{height: h, flex: 1}} />,
      };
    };

    // Render each item
    const renderItemInternal = (data: ItemT, idx: number) => {
      const originalIdx = infinite ? idx % N : idx;
      const isSelected = infinite
        ? idx === N + selectedIndex
        : idx === selectedIndex;

      if (props.renderItem) {
        return props.renderItem(data, originalIdx, isSelected);
      }

      let display: string;
      if (typeof data === 'number' && typeof props.zeroPadLength === 'number') {
        display = String(data).padStart(props.zeroPadLength, '0');
      } else {
        display = String(data);
      }

      return (
        <View style={[styles.itemWrapper, {height: itemHeight}]} key={idx}>
          <Text
            style={
              isSelected
                ? [props.activeItemTextStyle || styles.activeItemTextStyle]
                : [props.itemTextStyle || styles.itemTextStyle]
            }>
            {display}
          </Text>
        </View>
      );
    };

    // Scroll fix: snap to item & recenter for infinite mode
    const scrollFix = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        let y = e.nativeEvent.contentOffset.y;
        const h = itemHeight;
        const rawIndex = Math.round(y / h);

        // If infinite, mod rawIndex to original range
        const mod = infinite ? ((rawIndex % N) + N) % N : rawIndex;
        const centerIdx = infinite ? N + mod : mod;
        const targetY = centerIdx * h;

        // If not aligned, scroll to the correct position
        if (Math.abs(targetY - y) > 0.5) {
          if (Platform.OS === 'ios') {
            setIsScrollTo(true);
          }
          sView.current?.scrollTo({y: targetY, animated: false});
        }

        // Call onValueChange if value changed
        if (selectedIndex !== mod) {
          setSelectedIndex(mod);
          props.onValueChange?.(props.dataSource[mod], mod);
        }
      },
      [itemHeight, props, selectedIndex, infinite, N],
    );

    const onScrollBeginDrag = () => {
      setDragStarted(true);
      if (Platform.OS === 'ios') {
        setIsScrollTo(false);
      }
      timer && clearTimeout(timer);
    };

    const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setDragStarted(false);
      const ev = {...e};
      timer && clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          if (!momentumStarted) {
            scrollFix(ev);
          }
        }, 50),
      );
    };

    const onMomentumScrollBegin = () => {
      setMomentumStarted(true);
      timer && clearTimeout(timer);
    };

    const onMomentumScrollEnd = (
      e: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
      setMomentumStarted(false);
      if (!isScrollTo && !dragStarted) {
        scrollFix(e);
      }
    };

    const {header, footer} = renderPlaceHolder();
    const highlightWidth =
      (isViewStyle(style) ? style.width : 0) || deviceWidth;
    const highlightColor = props.highlightColor || '#333';
    const highlightBorderWidth =
      props.highlightBorderWidth ?? StyleSheet.hairlineWidth;

    const wrapperStyle: ViewStyle = {
      height: wrapperHeight,
      flex: 1,
      backgroundColor: props.wrapperBackground || '#fafafa',
      overflow: 'hidden',
    };

    const highlightStyle: ViewStyle = {
      position: 'absolute',
      top: (wrapperHeight - itemHeight) / 2,
      height: itemHeight,
      width: highlightWidth,
      borderTopColor: highlightColor,
      borderBottomColor: highlightColor,
      borderTopWidth: highlightBorderWidth,
      borderBottomWidth: highlightBorderWidth,
    };

    const CustomScrollViewComponent = scrollViewComponent || ScrollView;

    return (
      <View style={wrapperStyle}>
        <View style={highlightStyle} />
        <CustomScrollViewComponent
          ref={sView}
          bounces={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          onMomentumScrollBegin={() => onMomentumScrollBegin()}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={() => onScrollBeginDrag()}
          onScrollEndDrag={onScrollEndDrag}
          {...props}>
          {header}
          {dataList.map((d, idx) => renderItemInternal(d, idx))}
          {footer}
        </CustomScrollViewComponent>
      </View>
    );
  },
);

export default ScrollPicker;

const styles = StyleSheet.create({
  itemWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextStyle: {
    color: '#999',
  },
  activeItemTextStyle: {
    color: '#333',
  },
});
