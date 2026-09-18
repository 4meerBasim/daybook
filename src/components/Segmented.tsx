import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { borderStart, row } from '../lib/rtl';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { c, ui, rtl, chipPadding } = useTheme();
  return (
    <View
      style={{
        flexDirection: row(rtl),
        borderWidth: 1,
        borderColor: c.rule,
        borderRadius: radius.chip,
        overflow: 'hidden',
      }}
    >
      {options.map((o, i) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            hitSlop={{ top: 9, bottom: 9 }}
            android_ripple={null}
            style={[
              {
                height: 26,
                paddingHorizontal: chipPadding,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? c.ink : 'transparent',
              },
              i === 0 ? null : borderStart(rtl, 1, c.rule),
            ]}
          >
            <Text style={[ui(12, 500), { color: on ? c.paper : c.ink2, lineHeight: undefined }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
