import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { longDate, minutesLabel, stamped } from '../lib/date';
import { useClosedPage, useStore } from '../state/store';
import { rowTitle, type Outcome } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { EmptyRules, Ledger, LedgerRow } from '../components/Ledger';
import { Stamp } from '../components/Stamp';
import { ChevronBackIcon } from '../components/Icon';

function outcomeLabel(outcome: Outcome, t: ReturnType<typeof useTheme>['t']): string {
  switch (outcome) {
    case 'settled':
      return t.settledWord;
    case 'carried':
      return t.carriedWord;
    case 'struck':
      return t.struckWord;
    case 'rescheduled':
      return t.movedWord;
  }
}

export function PageClosedScreen({
  day,
  onBack,
  onPlanTomorrow,
}: {
  day: number;
  onBack: () => void;
  onPlanTomorrow: () => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { planTomorrow } = useStore();
  const { day: closed, entries } = useClosedPage(day);
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const [filled, setFilled] = useState<number | null>(null);

  const settled = entries.filter((e) => e.outcome === 'settled');
  const carried = entries.filter((e) => e.outcome === 'carried');
  const struck = entries.filter((e) => e.outcome === 'struck');
  const moved = entries.filter((e) => e.outcome === 'rescheduled');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <View style={{ flexDirection: row(rtl), marginBottom: 4 }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              android_ripple={null}
              style={{
                width: metrics.minTap,
                height: metrics.minTap,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronBackIcon color={c.ink2} flip={rtl} />
            </Pressable>
          </View>

          <Text style={[display(15, { italic: true }), { color: c.ink2, textAlign: align(rtl) }]}>
            {longDate(day, t)}
          </Text>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.pageClosed}
          </Text>
        </View>

        <Ledger>
          {entries.map((entry) => (
            <LedgerRow key={entry.taskId} start={metrics.content}>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[
                  ui(17, 400, 22),
                  {
                    flex: 1,
                    minWidth: 0,
                    color: entry.outcome === 'carried' ? c.ink : c.ink3,
                    textDecorationLine:
                      entry.outcome === 'settled' || entry.outcome === 'struck'
                        ? 'line-through'
                        : 'none',
                    textAlign: align(rtl),
                  },
                ]}
              >
                {rowTitle(entry, t)}
              </Text>
              <Text numberOfLines={1} style={[mono(11, 500, 0.1), { color: c.ink3 }]}>
                {outcomeLabel(entry.outcome, t)}
              </Text>
            </LedgerRow>
          ))}

          <EmptyRules count={entries.length ? 1 : 3} />

          {closed ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', top: 96, left: 0, right: 0, alignItems: 'center' }}
            >
              <Stamp label={t.pageClosed} timestamp={stamped(closed.closedAt)} size={26} />
            </View>
          ) : null}
        </Ledger>

        <View
          style={[
            { paddingTop: 24, gap: 10 },
            pad(rtl, metrics.gutter, metrics.gutter),
          ]}
        >
          <Text
            style={[display(24, { italic: true }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {struck.length || carried.length ? t.closingLineMixed : t.closingLine}
          </Text>

          <Text style={[mono(13, 500), { color: c.ink3, textAlign: align(rtl) }]}>
            {settled.length} {t.settledWord}
            {carried.length ? ` · ${carried.length} ${t.carriedWord}` : ''}
            {moved.length ? ` · ${moved.length} ${t.movedWord}` : ''}
            {struck.length ? ` · ${struck.length} ${t.struckWord}` : ''}
          </Text>

          {closed && closed.committedMinutes ? (
            <Text style={[mono(13, 500), { color: c.ink3, textAlign: align(rtl) }]}>
              {minutesLabel(closed.settledMinutes, t)} / {minutesLabel(closed.committedMinutes, t)}
            </Text>
          ) : null}

          <Pressable
            onPress={async () => {
              const count = await planTomorrow();
              if (count) onPlanTomorrow();
              else setFilled(0);
            }}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.planTomorrow}
            style={{
              minHeight: metrics.ruling,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 18,
            }}
          >
            <Text style={[ui(17, 500), { color: c.ink }]}>{t.planTomorrow}</Text>
          </Pressable>

          {filled === 0 ? (
            <Text style={[mono(12, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.nothingFits}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
