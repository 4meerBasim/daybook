import React, { useState } from 'react';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { matches } from '../lib/matches';
import { useStore, useTasks } from '../state/store';
import { projects } from '../data/seed';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';

export function RecentScreen({
  onOpenTask,
  onPickDate,
}: {
  onOpenTask: (taskId: string) => void;
  onPickDate: () => void;
}) {
  const { c, t } = useTheme();
  const { done, toggle, clear } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [query, setQuery] = useState('');

  const byId = new Map(projects(t).map((p) => [p.id, p]));
  const rows = useTasks()
    .reverse()
    .map((k) => ({ ...k, project: k.projectId ? byId.get(k.projectId) : undefined }))
    .filter((k) => matches(k.title, query) || matches(k.project?.name ?? t.noProject, query));

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader title={t.recent} scrollY={scrollY} />

        <Ledger>
          {rows.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => clear(k.id)}
              onPickDate={onPickDate}
              onDelete={() => clear(k.id)}
              onLongPress={() => onOpenTask(k.id)}
            >
              <TaskRow
                title={k.title}
                meta={k.project?.name ?? t.noProject}
                dotColor={c[k.project?.color ?? 'ink3']}
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

          {rows.length === 0 && query.trim() ? <SectionLabel label={t.noMatches} /> : null}

          <EmptyRules count={4} />
        </Ledger>
      </Animated.ScrollView>

      <SearchField value={query} onChangeText={setQuery} />
    </Screen>
  );
}
