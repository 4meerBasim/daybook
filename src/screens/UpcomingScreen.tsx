import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { addDays, dayOfMonth, startOfDay, timeLabel } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle, type DatedTask } from '../db/schema';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, Dot, EmptyRules, Ledger, LedgerRow } from '../components/Ledger';

function dateLabel(items: DatedTask[]): string {
  const first = dayOfMonth(items[0].dueDate);
  const last = dayOfMonth(items[items.length - 1].dueDate);
  return first === last ? String(first) : `${first}–${last}`;
}

export function UpcomingScreen() {
  const { c, t, ui, mono, display, rtl, unit } = useTheme();
  const { upcoming } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const now = Date.now();
  const dayAfterTomorrow = startOfDay(addDays(now, 2));
  const weekEnd = startOfDay(addDays(now, 8));

  const groups = [
    { day: t.tomorrow, items: upcoming.filter((k) => k.dueDate < dayAfterTomorrow) },
    {
      day: t.weekGroup,
      items: upcoming.filter((k) => k.dueDate >= dayAfterTomorrow && k.dueDate < weekEnd),
    },
    { day: t.laterGroup, items: upcoming.filter((k) => k.dueDate >= weekEnd) },
  ].filter((g) => g.items.length > 0);

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader title={t.upcoming} scrollY={scrollY} />

        <Ledger>
          {groups.map((g) => (
            <React.Fragment key={g.day}>
              <View
                style={[
                  {
                    minHeight: unit,
                    flexDirection: row(rtl),
                    alignItems: 'baseline',
                    gap: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: c.rule,
                  },
                  pad(rtl, metrics.content, metrics.gutter),
                ]}
              >
                <Text
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  style={[display(20, { weight: 400, italic: true }), { color: c.ink }]}
                >
                  {g.day}
                </Text>
                <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
                  {dateLabel(g.items)}
                </Text>
                <View style={{ flex: 1 }} />
                <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
                  {g.items.length}
                </Text>
              </View>

              {g.items.map((k) => {
                const meta = timeLabel(k.dueDate);
                return (
                  <LedgerRow key={k.id}>
                    <Checkbox />
                    <Text
                      maxFontSizeMultiplier={maxFontSizeMultiplier}
                      style={[
                        ui(17, 400, 22),
                        { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
                        marginStart(rtl, 16),
                      ]}
                    >
                      {rowTitle(k, t)}
                    </Text>
                    <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
                      <Dot color={c[k.color]} />
                      {meta ? (
                        <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
                          {meta}
                        </Text>
                      ) : null}
                    </View>
                  </LedgerRow>
                );
              })}
            </React.Fragment>
          ))}

          <EmptyRules count={2} />
        </Ledger>
      </Animated.ScrollView>
    </Screen>
  );
}
