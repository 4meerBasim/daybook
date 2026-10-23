import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier } from '../theme/tokens';
import { useTabBarFootprint } from '../components/TabBar';
import { marginStart, row } from '../lib/rtl';
import { isOverdue, isYesterday, longDate, timeLabel } from '../lib/date';
import { useStore } from '../state/store';
import { rowTitle } from '../db/schema';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, EmptyRules, Ledger, LedgerRow, SectionLabel } from '../components/Ledger';
import { CapacityLine } from '../components/CapacityLine';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { Stamp } from '../components/Stamp';
import { StreakTallyIcon } from '../components/Icon';

const HOUR_UNIT_MINUTES = 60;

export function TodayScreen({
  onStamp,
  onOpenTask,
  onPickDate,
}: {
  onStamp: () => void;
  onOpenTask: (taskId: string) => void;
  onPickDate: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const tabBarFootprint = useTabBarFootprint();
  const { today, loaded, capacity, complete, snooze, remove } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const now = Date.now();
  const open = today.filter((k) => k.completedAt === null);
  const leftN = open.length;
  const allDone = loaded && leftN === 0;
  const committed = open.reduce((total, k) => total + (k.duration ?? 0), 0);
  const unestimated = open.filter((k) => k.duration === null).length;
  const overrunUnits = Math.min(
    4,
    Math.ceil(Math.max(committed - capacity, 0) / HOUR_UNIT_MINUTES)
  );

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'snooze', label: t.tomorrow },
    { name: 'pickDate', label: t.pickDate },
    { name: 'delete', label: t.delete },
  ];

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: tabBarFootprint }}
      >
        <PageHeader
          title={t.today}
          dateLine={longDate(now, t)}
          trailing={leftN ? `${leftN} ${t.left}` : t.allDoneShort}
          scrollY={scrollY}
        />

        <CapacityLine committed={committed} capacity={capacity} unestimated={unestimated} />

        <Ledger>
          {today.map((k) => {
            const done = k.completedAt !== null;
            return (
              <SwipeableRow
                key={k.id}
                onComplete={() => complete(k.id, !done)}
                onSnooze={() => snooze(k.id, 'tomorrow')}
                onPickDate={onPickDate}
                onDelete={() => remove(k.id)}
                onLongPress={() => onOpenTask(k.id)}
              >
                <TaskRow
                  title={rowTitle(k, t)}
                  meta={isYesterday(k.dueDate, now) ? t.yesterday : timeLabel(k.dueDate)}
                  dotColor={c[k.color]}
                  done={done}
                  overdue={isOverdue(k.dueDate, now)}
                  onToggle={() => complete(k.id, !done)}
                  accessibilityActions={swipeActions}
                  onAccessibilityAction={(e) => {
                    const action = e.nativeEvent.actionName;
                    if (action === 'complete') complete(k.id, !done);
                    if (action === 'snooze') snooze(k.id, 'tomorrow');
                    if (action === 'pickDate') onPickDate();
                    if (action === 'delete') remove(k.id);
                  }}
                />
              </SwipeableRow>
            );
          })}

          <SectionLabel label={t.habits} />

          <LedgerRow>
            <Checkbox circle color={c.moss} />
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17, 400, 22), { flex: 1, minWidth: 0, color: c.ink }, marginStart(rtl, 16)]}
            >
              {t.habit1}
            </Text>
            <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
              <StreakTallyIcon color={c.moss} flip={rtl} />
              <Text numberOfLines={1} style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>
                12
              </Text>
            </View>
          </LedgerRow>

          <EmptyRules count={4} overrun={overrunUnits} />
        </Ledger>
      </Animated.ScrollView>

      {allDone ? (
        <Pressable
          onPress={onStamp}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.pageClosed}
          style={{ position: 'absolute', top: 300, left: 0, right: 0, alignItems: 'center' }}
        >
          <Stamp label={t.pageClosed} />
        </Pressable>
      ) : null}
    </Screen>
  );
}
