import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';

export function Screen({
  children,
  paper2 = false,
}: {
  children?: React.ReactNode;
  paper2?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: paper2 ? c.paper2 : c.paper, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

export function useHeaderTop() {
  return useSafeAreaInsets().top + 2;
}

export function useScreenBottom() {
  return Math.max(useSafeAreaInsets().bottom, metrics.gutter);
}
