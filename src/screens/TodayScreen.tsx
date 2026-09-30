import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { useHabits, useStore, useTasks } from '../state/store';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { AddRow, Checkbox, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';
import { Stamp } from '../components/Stamp';
import { StreakTallyIcon } from '../components/Icon';

export function TodayScreen({
  onStamp,
  onOpenProject,
  onOpenHabit,
  onAddProject,
  onAddHabit,
}: {
  onStamp: () => void;
  onOpenProject: (projectId: string | null) => void;
  onOpenHabit: (habitId: string) => void;
  onAddProject: () => void;
  onAddHabit: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { done, habitSessions } = useStore();
  const habits = useHabits();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const leftN = useTasks().filter((k) => k.list === 'today' && !k.later && !done[k.id]).length;
  const allDone = leftN === 0;

  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader
          title={t.today}
          dateLine={t.dateLine}
          trailing={leftN ? `${leftN} ${t.left}` : t.allDoneShort}
          scrollY={scrollY}
        />

        <Ledger>
          <ProjectRows list="today" query={query} onOpen={onOpenProject} onAdd={onAddProject} />

          {searching ? null : (
            <>
              <SectionLabel label={t.habits} />

              {habits.map((h) => {
                const sessions = habitSessions.filter((s) => s.habitId === h.id).length;
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => onOpenHabit(h.id)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={[
                      h.name,
                      h.minutes > 0 ? `${t.target} ${h.minutes} ${t.minutes}` : '',
                      `${t.sessionsToday}: ${sessions}`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    style={({ pressed }) => [
                      {
                        height: metrics.row,
                        flexDirection: row(rtl),
                        alignItems: 'center',
                        gap: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: c.rule,
                        backgroundColor: pressed ? c.paper2 : 'transparent',
                      },
                      pad(rtl, 16, metrics.gutter),
                    ]}
                  >
                    <Checkbox circle color={c.moss} checked={sessions > 0} />
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.6}
                      style={[
                        ui(17, 400, 22),
                        { flex: 1, color: c.ink, textAlign: align(rtl) },
                        marginStart(rtl, 16),
                      ]}
                    >
                      {h.name}
                    </Text>
                    {h.minutes > 0 ? (
                      <Text style={[mono(12, 500, 0, true), { color: c.ink3 }]}>
                        {`${h.minutes} ${t.minShort}`}
                      </Text>
                    ) : null}
                    {h.streak > 0 ? (
                      <View style={{ flexDirection: row(rtl), alignItems: 'center' }}>
                        <StreakTallyIcon color={c.moss} flip={rtl} />
                        <Text style={[mono(12, 500), { color: c.moss }, marginStart(rtl, 6)]}>
                          {h.streak}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}

              <AddRow label={t.newHabit} onPress={onAddHabit} />
            </>
          )}

          <EmptyRules count={4} />
        </Ledger>
      </Animated.ScrollView>

      <SearchField value={query} onChangeText={setQuery} />

      {allDone ? (
        <Pressable
          onPress={onStamp}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={t.pageClosed}
          style={{ position: 'absolute', top: 300, alignSelf: 'center' }}
        >
          <Stamp label={t.pageClosed} />
        </Pressable>
      ) : null}
    </Screen>
  );
}
