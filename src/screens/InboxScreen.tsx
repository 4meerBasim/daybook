import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, priorityColors } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { collectTags, hasTag, matches } from '../lib/matches';
import { tomorrowMorning } from '../lib/day';
import type { Task } from '../data/seed';
import { useStore, useTasks } from '../state/store';
import { categorize, CATEGORY_LABEL_KEY, CATEGORY_ORDER } from '../lib/autoCategorize';
import { Screen } from '../components/Screen';
import { PageHeader } from '../components/PageHeader';
import { SearchField, searchFieldInset } from '../components/SearchField';
import { EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ProjectRows } from '../components/ProjectRows';
import { TagFilterBar } from '../components/TagFilterBar';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { DueDatePickerModal } from '../components/DueDatePicker';
import { Toggle } from '../components/Toggle';

type Nav = { navigate: (screen: string, params?: object) => void };

export function InboxScreen({
  onOpenProject,
  onAddProject,
}: {
  onOpenProject: (projectId: string | null) => void;
  onAddProject: () => void;
}) {
  const { c, t, ui, rtl, ar } = useTheme();
  const navigation = useNavigation() as unknown as Nav;
  const { done, toggle, clear, ensureTask, setDue } = useStore();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const [query, setQuery] = useState('');
  const [grouped, setGrouped] = useState(false);
  const [pickId, setPickId] = useState<string | null>(null);
  const inList = useTasks().filter((k) => k.list === 'inbox');
  const count = inList.length;

  const tags = collectTags(inList);
  const [tag, setTag] = useState<string | null>(null);
  const sel = tag && tags.includes(tag) ? tag : null;

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'snooze', label: t.tomorrow },
    { name: 'pickDate', label: t.pickDate },
    { name: 'delete', label: t.delete },
  ];
  const openPick = (id: string) => {
    const task = inList.find((k) => k.id === id);
    if (!task) return;
    if (!task.id.startsWith('a')) ensureTask(task);
    setPickId(id);
  };
  const openTask = (taskId: string) => navigation.navigate('TaskDetail', { taskId });
  const snooze = (task: Task) => {
    if (!task.id.startsWith('a')) ensureTask(task);
    setDue(task.id, tomorrowMorning(), false);
  };

  const pickTask = pickId ? inList.find((k) => k.id === pickId) : undefined;

  const groupRows = inList
    .filter((k) => hasTag(k.tags, sel))
    .filter((k) => matches(k.title, query));
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: groupRows.filter((k) => categorize(k.title, ar) === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: searchFieldInset }}
      >
        <PageHeader title={t.inbox} trailing={String(count)} scrollY={scrollY} />

        <TagFilterBar tags={tags} selected={sel} onSelect={setTag} />

        <View
          style={[
            {
              flexDirection: row(rtl),
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 10,
            },
            pad(rtl, metrics.gutter, metrics.gutter),
          ]}
        >
          <Text style={[ui(14, 500), { color: c.ink2, textAlign: align(rtl) }]}>{t.groupByCategory}</Text>
          <Toggle value={grouped} onChange={setGrouped} accessibilityLabel={t.groupByCategory} />
        </View>

        {grouped ? (
          <Ledger>
            {groups.map((g) => (
              <View key={g.cat}>
                <SectionLabel label={t[CATEGORY_LABEL_KEY[g.cat]] as string} />
                {g.items.map((k) => (
                  <SwipeableRow
                    key={k.id}
                    onComplete={() => toggle(k.id)}
                    onSnooze={() => snooze(k)}
                    onPickDate={() => openPick(k.id)}
                    onDelete={() => clear(k.id)}
                    onLongPress={() => openTask(k.id)}
                  >
                    <TaskRow
                      title={k.title}
                      meta={[k.priority && k.priority !== 'none' ? t[k.priority] : '', k.meta]
                        .filter(Boolean)
                        .join(' · ')}
                      dotColor={
                        k.priority && k.priority !== 'none'
                          ? c[priorityColors[k.priority].fg]
                          : undefined
                      }
                      done={!!done[k.id]}
                      overdue={k.over}
                      onToggle={() => toggle(k.id)}
                      accessibilityActions={swipeActions}
                      onAccessibilityAction={(e) => {
                        const action = e.nativeEvent.actionName;
                        if (action === 'complete') toggle(k.id);
                        if (action === 'snooze') snooze(k);
                        if (action === 'pickDate') openPick(k.id);
                        if (action === 'delete') clear(k.id);
                      }}
                    />
                  </SwipeableRow>
                ))}
              </View>
            ))}
            {groups.length === 0 ? <SectionLabel label={t.noMatches} /> : null}
            <EmptyRules count={4} />
          </Ledger>
        ) : (
          <Ledger>
            <ProjectRows
              list="inbox"
              query={query}
              tagFilter={sel}
              onOpen={onOpenProject}
              onAdd={onAddProject}
            />

            {query.trim() ? null : <SectionLabel label={`${t.someday} · 4`} />}

            <EmptyRules count={5} />
          </Ledger>
        )}
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
