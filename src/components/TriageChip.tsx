import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

export function TriageChip({
  label,
  tint,
  onPress,
}: {
  label: string;
  tint: string;
  onPress: () => void;
}) {
  const { c, ui, chipPadding } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 11, bottom: 11 }}
      style={({ pressed }) => ({
        minHeight: 26,
        paddingHorizontal: chipPadding,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: c.rule,
        backgroundColor: pressed ? tint : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Text numberOfLines={1} style={[ui(12, 500), { lineHeight: undefined, color: c.ink2 }]}>
        {label}
      </Text>
    </Pressable>
  );
}
