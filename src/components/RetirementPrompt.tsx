import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { TriageChip } from './TriageChip';

export function RetirementPrompt({
  carryCount,
  onDoIt,
  onSchedule,
  onShelve,
}: {
  carryCount: number;
  onDoIt: () => void;
  onSchedule: () => void;
  onShelve: () => void;
}) {
  const { c, t, mono, rtl, unit } = useTheme();

  return (
    <View
      style={{
        minHeight: unit,
        justifyContent: 'center',
        backgroundColor: c.ochS,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View
        style={[
          {
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            paddingVertical: 10,
          },
          pad(rtl, metrics.content, metrics.gutter),
        ]}
      >
        <Text style={[mono(11, 500, 0.1), { flex: 1, color: c.ink2, textAlign: align(rtl) }]}>
          {t.carriedTimes.replace('{n}', String(carryCount))} {'—'} {t.retireAsk}
        </Text>
        <TriageChip label={t.doIt} tint={c.mossS} onPress={onDoIt} />
        <TriageChip label={t.scheduleIt} tint={c.blueS} onPress={onSchedule} />
        <TriageChip label={t.shelveIt} tint={c.ochS} onPress={onShelve} />
      </View>
    </View>
  );
}
