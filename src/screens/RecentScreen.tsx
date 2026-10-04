import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { isOverdue, tomorrowMorning } from '../lib/day';
import { collectTags, hasTag, matches } from '../lib/matches';
import { isSeedTaskId } from '../data/seed';
import { useProjects, useStore, useSubtaskProgress, useTasks } from '../state/store';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { TaskRow, TaskRowProps } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { DueDatePickerModal } from '../components/DueDatePicker';
import { TagFilterBar } from '../components/TagFilterBar';
import { TimelineIcon } from '../components/Icon';

function TaskRowWithProgress({ taskId, ...rest }: Omit<TaskRowProps, 'progress'> & { taskId: string }) {
  const progress = useSubtaskProgress(taskId);
  return <TaskRow {...rest} progress={progress.total > 0 ? progress : undefined} />;
}

export function RecentScreen({
  onOpenTask,
  onPickDate,
  onOpenTimeline,
}: {
  onOpenTask: (taskId: string) => void;
  onPickDate: () => void;
  onOpenTimeline: () => void;
}) {
  const { c, t, ui, rtl } = useTheme();
  const { done, toggle, clear, ensureTask, setDue } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [query, setQuery] = useState('');
  const [pickId, setPickId] = useState<string | null>(null);

  const openPick = (id: string) => {
    const task = all.find((k) => k.id === id);
    if (!task) return;
    if (isSeedTaskId(task.id)) ensureTask(task);
    setPickId(id);
  };

  const snooze = (id: string) => {
    const task = all.find((k) => k.id === id);
    if (!task) return;
    if (isSeedTaskId(task.id)) ensureTask(task);
    setDue(id, tomorrowMorning(), false);
  };

  const all = useTasks();
  const tags = collectTags(all);
  const [tag, setTag] = useState<string | null>(null);
  const sel = tag && tags.includes(tag) ? tag : null;

  const byId = new Map(useProjects().map((p) => [p.id, p]));
  const rows = [...all]
    .reverse()
    .map((k) => ({ ...k, project: k.projectId ? byId.get(k.projectId) : undefined }))
    .filter((k) => matches(k.title, query) || matches(k.project?.name ?? t.noProject, query))
    .filter((k) => hasTag(k.tags, sel));

  const pickTask = pickId ? all.find((k) => k.id === pickId) : undefined;

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

        <TagFilterBar tags={tags} selected={sel} onSelect={setTag} />

        <Ledger>
          <Pressable
            onPress={onOpenTimeline}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.timelineMap}
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
            <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
              <TimelineIcon size={20} color={c.ink2} />
            </View>
            <Text
              numberOfLines={1}
              style={[ui(17, 400, 22), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 16)]}
            >
              {t.timelineMap}
            </Text>
          </Pressable>

          {rows.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => snooze(k.id)}
              onPickDate={() => openPick(k.id)}
              onDelete={() => clear(k.id)}
              onLongPress={() => onOpenTask(k.id)}
            >
              <TaskRowWithProgress
                taskId={k.id}
                title={k.title}
                meta={k.project?.name ?? t.noProject}
                dotColor={c[k.project?.color ?? 'ink3']}
                color={k.color ?? undefined}
                done={!!done[k.id]}
                overdue={isOverdue(k.dueAt, !!done[k.id])}
                onToggle={() => toggle(k.id)}
                accessibilityActions={swipeActions}
                onAccessibilityAction={(e) => {
                  const action = e.nativeEvent.actionName;
                  if (action === 'complete') toggle(k.id);
                  if (action === 'snooze') snooze(k.id);
                  if (action === 'pickDate') openPick(k.id);
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

      {pickTask ? (
        <DueDatePickerModal
          value={pickTask.dueAt ?? null}
          someday={pickTask.someday}
          onChange={(dueAt, someday) => {
            setDue(pickTask.id, dueAt, someday);
            setPickId(null);
          }}
          onClose={() => setPickId(null)}
        />
      ) : null}
    </Screen>
  );
}
