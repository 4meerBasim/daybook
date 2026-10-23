import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { useTabBarFootprint } from '../components/TabBar';
import { pad, row } from '../lib/rtl';
import { addDays, dayOfMonth, startOfDay, timeLabel } from '../lib/date';
import { useStore } from '../state/store';
import { inkDecay } from '../lib/decay';
import { rowTitle, type DatedTask } from '../db/schema';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { EmptyRules, Ledger } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';

function dateLabel(items: DatedTask[]): string {
  const first = dayOfMonth(items[0].dueDate);
  const last = dayOfMonth(items[items.length - 1].dueDate);
  return first === last ? String(first) : `${first}–${last}`;
}

export function UpcomingScreen({ onOpenTask }: { onOpenTask: (taskId: string) => void }) {
  const { c, t, mono, display, rtl, unit } = useTheme();
  const tabBarFootprint = useTabBarFootprint();
  const { upcoming, decayOn, complete, remove } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const now = Date.now();
  const dayAfterTomorrow = startOfDay(addDays(now, 2));
  const weekEnd = startOfDay(addDays(now, 8));

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'delete', label: t.delete },
  ];

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
        contentContainerStyle={{ paddingBottom: tabBarFootprint }}
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

              {g.items.map((k) => (
                <SwipeableRow
                  key={k.id}
                  onComplete={() => complete(k.id, true)}
                  onDelete={() => remove(k.id)}
                  onLongPress={() => onOpenTask(k.id)}
                >
                  <TaskRow
                    title={rowTitle(k, t)}
                    meta={timeLabel(k.dueDate)}
                    dotColor={c[k.color]}
                    carryCount={k.carryCount}
                    decay={inkDecay(k, now, decayOn)}
                    onToggle={() => complete(k.id, true)}
                    accessibilityActions={swipeActions}
                    onAccessibilityAction={(e) => {
                      const action = e.nativeEvent.actionName;
                      if (action === 'complete') complete(k.id, true);
                      if (action === 'delete') remove(k.id);
                    }}
                  />
                </SwipeableRow>
              ))}
            </React.Fragment>
          ))}

          <EmptyRules count={2} />
        </Ledger>
      </Animated.ScrollView>
    </Screen>
  );
}
