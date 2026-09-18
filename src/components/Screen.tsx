import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export function Screen({
  children,
  paper2 = false,
}: {
  children: React.ReactNode;
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
