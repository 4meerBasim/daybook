import React, { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, penShadow, priorityColors, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { useStore, useTasks } from '../state/store';
import { projects } from '../data/seed';
import type { RootParams } from '../navigation/Root';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { ChevronBackIcon, PenIcon } from '../components/Icon';
import { QuickAddSheet } from './QuickAddSheet';

export function ProjectScreen({ route, navigation }: NativeStackScreenProps<RootParams, 'Project'>) {
  const { projectId, list } = route.params;
  const { c, t, display, ui, mono, rtl, dark } = useTheme();
  const { done, toggle, clear, addTask } = useStore();
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const top = useHeaderTop();

  const project = projects(t).find((p) => p.id === projectId);
  const rows = useTasks().filter((k) => k.projectId === projectId && (!list || k.list === list));
  const doneN = rows.filter((k) => done[k.id]).length;

  const swipeActions = [
    { name: 'complete', label: t.done },
    { name: 'snooze', label: t.tomorrow },
    { name: 'pickDate', label: t.pickDate },
    { name: 'delete', label: t.delete },
  ];
  const onPickDate = () => navigation.navigate('Calendar');

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
          <View style={{ flexDirection: row(rtl) }}>
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

        <Ledger>
          {rows.map((k) => (
            <SwipeableRow
              key={k.id}
              onComplete={() => toggle(k.id)}
              onSnooze={() => clear(k.id)}
              onPickDate={onPickDate}
              onDelete={() => clear(k.id)}
              onLongPress={() => navigation.navigate('TaskDetail', { taskId: k.id })}
            >
              <TaskRow
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
    </Screen>
  );
}
