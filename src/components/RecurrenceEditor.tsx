import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { toArabicDigits } from '../lib/day';
import { RecurrenceRule } from '../lib/recurrence';
import { Toggle } from './Toggle';

type Props = {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
};

type FreqKey = 'none' | 'daily' | 'weekly' | 'monthly' | 'everyN';

function freqOf(value: RecurrenceRule | null): FreqKey {
  if (!value) return 'none';
  return value.freq;
}

function SelectChip({
  label,
  active,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { c, ui, chipPadding } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
      android_ripple={null}
      style={{
        minWidth: 44,
        height: 34,
        paddingHorizontal: chipPadding + 2,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: active ? c.ink : c.rule,
        backgroundColor: active ? c.ink : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[ui(13, 500), { color: active ? c.paper : c.ink2, lineHeight: undefined }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function RecurrenceEditor({ value, onChange }: Props) {
  const { c, t, ui, mono, ar, rtl } = useTheme();
  const freq = freqOf(value);
  const weekdays = value?.weekdays ?? [];
  const interval = value?.interval ?? 2;

  const pickFreq = (key: FreqKey) => {
    switch (key) {
      case 'none':
        return onChange(null);
      case 'daily':
        return onChange({ freq: 'daily', afterCompletion: value?.afterCompletion });
      case 'weekly':
        return onChange({
          freq: 'weekly',
          weekdays: value?.weekdays ?? [],
          afterCompletion: value?.afterCompletion,
        });
      case 'monthly':
        return onChange({ freq: 'monthly', afterCompletion: value?.afterCompletion });
      case 'everyN':
        return onChange({
          freq: 'everyN',
          interval: value?.interval ?? 2,
          afterCompletion: value?.afterCompletion,
        });
    }
  };

  const toggleWeekday = (uiIndex: number) => {
    const ruleDay = (uiIndex + 1) % 7;
    const next = weekdays.includes(ruleDay)
      ? weekdays.filter((d) => d !== ruleDay)
      : [...weekdays, ruleDay].sort((a, b) => a - b);
    onChange({ freq: 'weekly', weekdays: next, afterCompletion: value?.afterCompletion });
  };

  const setInterval = (text: string) => {
    const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const safe = Number.isFinite(n) && n >= 1 ? n : 1;
    onChange({ freq: 'everyN', interval: safe, afterCompletion: value?.afterCompletion });
  };

  const options: { key: FreqKey; label: string }[] = [
    { key: 'none', label: t.noRepeat },
    { key: 'daily', label: t.repeatDaily },
    { key: 'weekly', label: t.repeatWeekly },
    { key: 'monthly', label: t.repeatMonthly },
    { key: 'everyN', label: t.everyDays.replace('{n}', toArabicDigits(interval, ar)) },
  ];

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <SelectChip
            key={o.key}
            label={o.label}
            active={freq === o.key}
            onPress={() => pickFreq(o.key)}
          />
        ))}
      </View>

      {freq === 'weekly' ? (
        <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
          {t.weekdaysLong.map((name, i) => {
            const active = weekdays.includes((i + 1) % 7);
            return (
              <SelectChip
                key={name}
                label={name}
                active={active}
                onPress={() => toggleWeekday(i)}
                accessibilityLabel={`${t.onDays}: ${name}`}
              />
            );
          })}
        </View>
      ) : null}

      {freq === 'everyN' ? (
        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 12 }}>
          <Text style={[ui(15), { color: c.ink2, lineHeight: undefined }]}>{t.repeatEvery}</Text>
          <TextInput
            value={String(interval)}
            onChangeText={setInterval}
            keyboardType="number-pad"
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            selectionColor={c.ink}
            accessibilityLabel={t.everyDays.replace('{n}', toArabicDigits(interval, ar))}
            style={[
              ui(15),
              {
                minWidth: 56,
                height: 44,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: c.rule,
                borderRadius: radius.chip,
                color: c.ink,
                textAlign: 'center',
              },
            ]}
          />
          <Text style={[ui(15), { color: c.ink2, lineHeight: undefined }]}>{t.days}</Text>
        </View>
      ) : null}

      {value ? (
        <View
          style={{
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[ui(15), { color: c.ink, textAlign: align(rtl), lineHeight: undefined }]}>
              {t.afterCompletion}
            </Text>
            <Text style={[mono(11, 500), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.afterCompletionDesc}
            </Text>
          </View>
          <Toggle
            value={!!value.afterCompletion}
            onChange={(v) => onChange({ ...value, afterCompletion: v })}
            accessibilityLabel={t.afterCompletion}
          />
        </View>
      ) : null}
    </View>
  );
}
