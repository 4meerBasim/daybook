import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

type Props = {
  label: string;
  bg?: string;
  fg?: string;
  outline?: boolean;
  dashed?: boolean;
  height?: number;
};

export function Chip({ label, bg, fg, outline, dashed, height = 26 }: Props) {
  const { c, ui, chipPadding } = useTheme();
  const color = fg ?? (dashed ? c.ink3 : c.ink2);
  return (
    <View
      style={{
        minHeight: height,
        paddingHorizontal: chipPadding,
        borderRadius: radius.chip,
        backgroundColor: dashed || outline ? 'transparent' : bg,
        borderWidth: dashed || outline ? 1 : 0,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: c.rule,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
      }}
    >
      <Text numberOfLines={1} style={[ui(12, 500), { color, lineHeight: 16 }]}>
        {label}
      </Text>
    </View>
  );
}
