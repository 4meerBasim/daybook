import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { marginStart, pad, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { tasks } from '../data/seed';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { Checkbox, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { Stamp } from '../components/Stamp';
import { StreakTallyIcon } from '../components/Icon';

export function TodayScreen({
  onStamp,
  onOpenTask,
  onPickDate,
}: {
  onStamp: () => void;
  onOpenTask: () => void;
  onPickDate: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { done, toggle, cleared, clear } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const list = tasks(t).filter((k) => !cleared[k.id]);
  const leftN = list.filter((k) => !done[k.id]).length;
  const allDone = leftN === 0;

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
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <PageHeader
          title={t.today}
          dateLine={t.dateLine}
          trailing={leftN ? `${leftN} ${t.left}` : t.allDoneShort}
          scrollY={scrollY}
        />

        <Ledger>
          {list.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => clear(k.id)}
              onPickDate={onPickDate}
              onDelete={() => clear(k.id)}
              onLongPress={onOpenTask}
            >
              <TaskRow
                title={k.title}
                meta={k.time}
                dotColor={c[k.color]}
                done={!!done[k.id]}
                overdue={k.over}
                onToggle={() => toggle(k.id)}
                accessibilityActions={swipeActions}
                onAccessibilityAction={(e) => {
                  const action = e.nativeEvent.actionName;
                  if (action === 'complete') toggle(k.id);
                  if (action === 'snooze') clear(k.id);
                  if (action === 'pickDate') onPickDate();
                  if (action === 'delete') clear(k.id);
                }}
              />
            </SwipeableRow>
          ))}

          <SectionLabel label={t.habits} />

          <View
            style={[
              {
                height: metrics.row,
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              },
              pad(rtl, 16, metrics.gutter),
            ]}
          >
            <Checkbox circle color={c.moss} />
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.6}
              style={[ui(17, 400, 22), { flex: 1, color: c.ink }, marginStart(rtl, 16)]}
            >
              {t.habit1}
            </Text>
            <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
              <StreakTallyIcon color={c.moss} />
              <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>12</Text>
            </View>
          </View>

          <EmptyRules count={4} />
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
