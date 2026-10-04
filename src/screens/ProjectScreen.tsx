import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, penShadow, priorityColors, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { isOverdue, tomorrowMorning } from '../lib/day';
import { collectTags, hasTag } from '../lib/matches';
import type { RootParams } from '../navigation/Root';
import type { Task } from '../data/seed';
import { useProjects, useStore, useSubtaskProgress, useTasks } from '../state/store';
import { loadSnapshot } from '../lib/db';
import { isSyncConfigured } from '../lib/supabase';
import { getShareCode, shareProject, subscribeSharedProject } from '../lib/shared';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger } from '../components/Ledger';
import { TaskRow, TaskRowProps } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { DueDatePickerModal } from '../components/DueDatePicker';
import { TagFilterBar } from '../components/TagFilterBar';
import { ChevronBackIcon, PenIcon } from '../components/Icon';
import { QuickAddSheet } from './QuickAddSheet';

function TaskRowWithProgress({ taskId, ...rest }: Omit<TaskRowProps, 'progress'> & { taskId: string }) {
  const progress = useSubtaskProgress(taskId);
  return <TaskRow {...rest} progress={progress.total > 0 ? progress : undefined} />;
}

export function ProjectScreen({ route, navigation }: NativeStackScreenProps<RootParams, 'Project'>) {
  const { projectId, list } = route.params;
  const { c, t, display, ui, mono, rtl, dark } = useTheme();
  const { done, toggle, clear, addTask, ensureTask, setDue, ensureOwnerId, hydrate } = useStore();
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [typing, setTyping] = useState(false);
  const [pickId, setPickId] = useState<string | null>(null);

  const openPick = (task: Task) => {
    if (!task.id.startsWith('a')) ensureTask(task);
    setPickId(task.id);
  };
  const snooze = (task: Task) => {
    if (!task.id.startsWith('a')) ensureTask(task);
    setDue(task.id, tomorrowMorning(), false);
  };
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const top = useHeaderTop();

  const project = useProjects().find((p) => p.id === projectId);
  const projectTasks = useTasks().filter((k) => k.projectId === projectId && (!list || k.list === list));
  const tags = collectTags(projectTasks);
  const [tag, setTag] = useState<string | null>(null);
  const sel = tag && tags.includes(tag) ? tag : null;
  const rows = projectTasks.filter((k) => hasTag(k.tags, sel));
  const doneN = rows.filter((k) => done[k.id]).length;
  const pickTask = pickId ? rows.find((k) => k.id === pickId) : undefined;

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'snooze', label: t.tomorrow },
    { name: 'pickDate', label: t.pickDate },
    { name: 'delete', label: t.delete },
  ];
  const addDraft = () => {
    const title = draft.trim();
    if (!title) {
      Keyboard.dismiss();
      return;
    }
    addTask({ title, meta: '', list: list ?? 'today', projectId });
    setDraft('');
    scrollRef.current?.scrollTo({ y: scrollY.current + metrics.row });
  };

  const reloadStore = async () => {
    const snap = await loadSnapshot();
    hydrate(snap.store);
  };

  const onShare = async () => {
    if (!projectId) return;
    if (!isSyncConfigured()) {
      Alert.alert(t.syncRequiredToShare);
      return;
    }
    const ownerId = ensureOwnerId();
    const code = await shareProject(projectId, ownerId);
    if (code) Alert.alert(t.shareListTitle, `${t.shareListBody}\n\n${code}`);
    else Alert.alert(t.shareFailed);
  };

  useEffect(() => {
    if (!projectId || !isSyncConfigured()) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    (async () => {
      const code = await getShareCode(projectId);
      if (!active || !code) return;
      unsubscribe = subscribeSharedProject(projectId, () => {
        void reloadStore();
      });
    })();
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ paddingBottom: 32 + metrics.pen + 24 }}
      >
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 8 }}>
          <View style={{ flexDirection: row(rtl), alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => navigation.goBack()}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              style={[
                { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
                marginStart(rtl, -10),
              ]}
            >
              <ChevronBackIcon color={c.ink} flip={rtl} />
            </Pressable>
            {projectId ? (
              <Pressable
                onPress={onShare}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={t.shareList}
                hitSlop={metrics.hitSlop}
                style={{ height: 44, justifyContent: 'center' }}
              >
                <Text style={[mono(12, 500, 0.1, true), { color: c.blue }]}>{t.shareList}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
            <Dot color={project ? c[project.color] : c.ink3} size={8} />
            <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>
              {list ? `${t.project} · ${t[list].toUpperCase()}` : t.project}
            </Text>
          </View>

          <View
            style={{
              flexDirection: row(rtl),
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                display(40, { lineHeight: 44 }),
                { flexShrink: 1, color: c.ink, textAlign: align(rtl) },
              ]}
            >
              {project ? project.name : t.noProject}
            </Text>
            <Text
              accessibilityLabel={`${doneN} ${t.of} ${rows.length}`}
              style={[mono(22, 500), { color: c.ink2, paddingBottom: 4, writingDirection: 'ltr' }]}
            >
              <Text style={{ color: c.ink }}>{doneN}</Text> / {rows.length}
            </Text>
          </View>
        </View>

        <TagFilterBar tags={tags} selected={sel} onSelect={setTag} />

        <Ledger>
          {rows.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => snooze(k)}
              onPickDate={() => openPick(k)}
              onDelete={() => clear(k.id)}
              onLongPress={() => navigation.navigate('TaskDetail', { taskId: k.id })}
            >
              <TaskRowWithProgress
                taskId={k.id}
                title={k.title}
                meta={[
                  !done[k.id] && k.status && k.status !== 'todo' ? t[k.status] : '',
                  k.priority && k.priority !== 'none' ? t[k.priority] : '',
                  k.meta,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                dotColor={
                  k.priority && k.priority !== 'none' ? c[priorityColors[k.priority].fg] : undefined
                }
                color={k.color ?? undefined}
                done={!!done[k.id]}
                overdue={isOverdue(k.dueAt, !!done[k.id])}
                onToggle={() => toggle(k.id)}
                accessibilityActions={swipeActions}
                onAccessibilityAction={(e) => {
                  const action = e.nativeEvent.actionName;
                  if (action === 'complete') toggle(k.id);
                  if (action === 'snooze') snooze(k);
                  if (action === 'pickDate') openPick(k);
                  if (action === 'delete') clear(k.id);
                }}
              />
            </SwipeableRow>
          ))}

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
            <View
              style={{
                width: metrics.checkbox,
                height: metrics.checkbox,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: c.ink3,
                borderRadius: radius.checkbox,
              }}
            />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addDraft}
              submitBehavior="submit"
              returnKeyType="done"
              placeholder={t.placeholder}
              placeholderTextColor={c.ink3}
              selectionColor={c.ink}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
              style={[
                ui(17),
                { flex: 1, alignSelf: 'stretch', color: c.ink, padding: 0, textAlign: align(rtl) },
                marginStart(rtl, 16),
              ]}
            />
          </View>

          <EmptyRules count={4} />
        </Ledger>
      </ScrollView>

      {typing || adding ? null : (
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 32, alignItems: 'center' }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAdding(true);
            }}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.newTask}
            style={{
              width: metrics.pen,
              height: metrics.pen,
              borderRadius: radius.pen,
              backgroundColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
              ...penShadow(c, dark),
            }}
          >
            <PenIcon color={c.paper} />
          </Pressable>
        </View>
      )}

      {adding ? (
        <QuickAddSheet
          initialProjectId={projectId}
          undatedList={list ?? 'today'}
          onClose={() => setAdding(false)}
        />
      ) : null}

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
