import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { LABEL_COLORS } from '../theme/tokens';
import { row } from '../lib/rtl';
import { ColorKey } from '../data/seed';
import { CheckIcon, CloseIcon } from './Icon';

type Props = {
  value: ColorKey | null;
  onChange: (color: ColorKey | null) => void;
};

const COLOR_NAME: Record<ColorKey, 'blue' | 'ochre' | 'green' | 'red'> = {
  blue: 'blue',
  och: 'ochre',
  moss: 'green',
  ver: 'red',
};

export function ColorLabelPicker({ value, onChange }: Props) {
  const { c, t, rtl } = useTheme();

  return (
    <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      {LABEL_COLORS.map((key) => {
        const active = value === key;
        const name = t[COLOR_NAME[key]];
        return (
          <Pressable
            key={key}
            onPress={() => onChange(active ? null : key)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={name}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: c[key],
                borderWidth: active ? 2 : 0,
                borderColor: c.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {active ? <CheckIcon width={13} height={11} color={c.paper} /> : null}
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => onChange(null)}
        android_ripple={null}
        accessibilityRole="button"
        accessibilityState={{ selected: value == null }}
        accessibilityLabel={t.noColor}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: value == null ? 2 : 1.5,
            borderColor: value == null ? c.ink : c.ink3,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseIcon size={16} color={c.ink3} />
        </View>
      </Pressable>
    </View>
  );
}
