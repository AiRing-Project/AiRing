import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
  contentContainerStyle?: any;
  isTabScreen?: boolean;
}

const DEFAULT_HORIZONTAL = 20;
const DEFAULT_BOTTOM = 24;

const AppScreen = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  isTabScreen = false,
}: AppScreenProps) => {
  const insets = useSafeAreaInsets();
  const paddingHorizontal = DEFAULT_HORIZONTAL;
  const paddingBottom = isTabScreen
    ? DEFAULT_BOTTOM
    : DEFAULT_BOTTOM + insets.bottom;
  const paddingTop = insets.top;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, {paddingTop}, style]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {paddingHorizontal, paddingBottom},
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {paddingHorizontal, paddingTop, paddingBottom},
        style,
      ]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default AppScreen;
