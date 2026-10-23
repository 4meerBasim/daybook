import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { pad, row } from '../lib/rtl';
import { minutesLabel } from '../lib/date';

export function CapacityLine({
  committed,
  capacity,
  unestimated,
}: {
  committed: number;
  capacity: number;
  unestimated: number;
}) {
  const { c, t, mono, rtl } = useTheme();
  const over = committed > capacity;

  return (
    <View
      style={[
        { flexDirection: row(rtl), alignItems: 'center', gap: 8, paddingBottom: 10 },
        pad(rtl, metrics.gutter, metrics.gutter),
      ]}
    >
      <Text style={[mono(12, 500, 0.1), { color: over ? c.ver : c.ink3 }]}>
        {minutesLabel(committed, t)} / {minutesLabel(capacity, t)}
      </Text>
      {over ? (
        <Text style={[mono(12, 500, 0.1), { color: c.ver }]}>{t.overCapacity}</Text>
      ) : null}
      <View style={{ flex: 1 }} />
      {unestimated ? (
        <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>
          {unestimated} {t.unestimated}
        </Text>
      ) : null}
    </View>
  );
}
