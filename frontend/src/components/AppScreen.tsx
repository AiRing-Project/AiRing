import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
  contentContainerStyle?: any;
  isTabScreen?: boolean;
}

const DEFAULT_HORIZONTAL = 20;

const AppScreen = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  isTabScreen = false,
}: AppScreenProps) => {
  const paddingHorizontal = DEFAULT_HORIZONTAL;
  const edges = isTabScreen ? (['top'] as const) : (['top', 'bottom'] as const);

  if (scrollable) {
    return (
      <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {paddingHorizontal},
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safeArea, {paddingHorizontal}, style]}>
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
