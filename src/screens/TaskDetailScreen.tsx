import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, priorityColors, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { formatDay, formatTime, tomorrowMorning } from '../lib/day';
import type { Priority, Status } from '../data/seed';
import { useProjects, useStore, useTasks } from '../state/store';
import { Screen, useHeaderTop } from '../components/Screen';
import { Checkbox } from '../components/Ledger';
import { Toggle } from '../components/Toggle';
import { ChevronBackIcon, EllipsisIcon } from '../components/Icon';
import { DueDatePicker, useDateTimePicker } from '../components/DueDatePicker';
import { RecurrenceEditor } from '../components/RecurrenceEditor';
import { SubtaskList } from '../components/SubtaskList';
import { ColorLabelPicker } from '../components/ColorLabelPicker';
import { AttachmentsSection } from '../components/Attachments';

const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high'];
const STATUSES: Status[] = ['todo', 'doing', 'waiting'];

export function TaskDetailScreen({
  taskId,
  onBack,
  onFocus,
}: {
  taskId: string;
  onBack: () => void;
  onFocus: () => void;
}) {
  const { c, t, ui, mono, display, ar, rtl } = useTheme();
  const { done, toggle, ensureTask, setDue, setTaskReminder, setRecurrence, setColor, updateTask } =
    useStore();
  const top = useHeaderTop();
  const reminderPicker = useDateTimePicker();

  const task = useTasks().find((k) => k.id === taskId);
  const project = useProjects().find((p) => p.id === task?.projectId);
  const checked = !!done[taskId];

  useEffect(() => {
    if (task && !task.id.startsWith('a')) ensureTask(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const priority = task?.priority ?? 'none';
  const status = task?.status ?? 'todo';
  const reminderOn = task?.reminderAt != null;

  const onDueChange = (dueAt: number | null, someday: boolean) => {
    if (task) setDue(task.id, dueAt, someday);
  };

  const toggleReminder = (on: boolean) => {
    if (!task) return;
    if (!on) {
      setTaskReminder(task.id, null);
      return;
    }
    setTaskReminder(task.id, task.dueAt ?? tomorrowMorning());
  };

  const editReminderTime = () => {
    if (!task) return;
    const base = new Date(task.reminderAt ?? task.dueAt ?? tomorrowMorning());
    reminderPicker.open(base, (d) => setTaskReminder(task.id, d.getTime()));
  };

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: metrics.tabBar }}
      >
        <View
          style={{
            paddingTop: top + 40,
            paddingHorizontal: metrics.gutter,
            flexDirection: row(rtl),
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={onBack}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            android_ripple={null}
          >
            <ChevronBackIcon color={c.ink2} flip={rtl} />
          </Pressable>
          <Text style={[mono(12, 500, 0.1, true), { color: c.ink2 }]}>
            {task ? (project ? project.name : t.noProject) : ''}
          </Text>
          <Pressable
            onPress={onFocus}
            hitSlop={metrics.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={t.focusTask}
            android_ripple={null}
          >
            <EllipsisIcon color={c.ink2} />
          </Pressable>
        </View>

        {task ? (
          <>
            <Pressable
              onPress={() => {
                if (!checked) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggle(taskId);
              }}
              android_ripple={null}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={task.title}
              style={{
                paddingTop: 24,
                paddingBottom: 16,
                paddingHorizontal: metrics.gutter,
                flexDirection: row(rtl),
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <View style={{ marginTop: 8 }}>
                <Checkbox checked={checked} />
              </View>
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[
                  display(30, { lineHeight: 36 }),
                  {
                    flex: 1,
                    color: checked ? c.ink3 : c.ink,
                    textDecorationLine: checked ? 'line-through' : 'none',
                    textAlign: align(rtl),
                  },
                ]}
              >
                {task.title}
              </Text>
            </Pressable>

            <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
              <Block label={t.dueDate}>
                <DueDatePicker
                  value={task.dueAt ?? null}
                  someday={task.someday}
                  onChange={onDueChange}
                />
              </Block>

              <Block label={t.reminder}>
                <View
                  style={{
                    flexDirection: row(rtl),
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <Text style={[ui(15), { color: c.ink, lineHeight: undefined }]}>
                    {reminderOn ? t.remindAt : t.addReminder}
                  </Text>
                  <Toggle
                    value={reminderOn}
                    onChange={toggleReminder}
                    accessibilityLabel={t.reminder}
                  />
                </View>
                {reminderOn && task.reminderAt != null ? (
                  <Pressable
                    onPress={editReminderTime}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.remindAt}: ${formatDay(
                      new Date(task.reminderAt),
                      t,
                      ar
                    )} ${formatTime(task.reminderAt, ar)}`}
                    style={{ minHeight: 44, justifyContent: 'center' }}
                  >
                    <Text
                      style={[
                        mono(13, 500),
                        { color: c.ink2, textAlign: align(rtl), writingDirection: rtl ? 'rtl' : 'ltr' },
                      ]}
                    >
                      {`${formatDay(new Date(task.reminderAt), t, ar)} · ${formatTime(
                        task.reminderAt,
                        ar
                      )}`}
                    </Text>
                  </Pressable>
                ) : null}
              </Block>

              <Block label={t.repeat}>
                <RecurrenceEditor
                  value={task.recurrence ?? null}
                  onChange={(rule) => setRecurrence(task.id, rule)}
                />
              </Block>

              <Block label={t.colorLabel}>
                <ColorLabelPicker
                  value={task.color ?? null}
                  onChange={(color) => setColor(task.id, color)}
                />
              </Block>

              <Block label={t.priority}>
                <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
                  {PRIORITIES.map((p) => {
                    const active = priority === p;
                    const colored = active && p !== 'none';
                    return (
                      <Choice
                        key={p}
                        label={t[p]}
                        active={active}
                        bg={colored ? c[priorityColors[p].bg] : undefined}
                        fg={colored ? c[priorityColors[p].fg] : undefined}
                        onPress={() => updateTask(task.id, { priority: p })}
                      />
                    );
                  })}
                </View>
              </Block>

              <Block label={t.status}>
                <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
                  {STATUSES.map((s) => (
                    <Choice
                      key={s}
                      label={t[s]}
                      active={status === s}
                      onPress={() => updateTask(task.id, { status: s })}
                    />
                  ))}
                </View>
              </Block>

              <Block label={t.subtasks}>
                <SubtaskList taskId={task.id} />
              </Block>

              <Block label={t.attachments}>
                <AttachmentsSection taskId={task.id} />
              </Block>

              <View
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: metrics.gutter,
                  gap: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                }}
              >
                <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>
                  {t.description}
                </Text>
                <Text
                  style={[
                    ui(15, 400, 22),
                    { color: task.desc ? c.ink2 : c.ink3, textAlign: align(rtl) },
                  ]}
                >
                  {task.desc || t.none}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {reminderPicker.element}
    </Screen>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: metrics.gutter,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3, textAlign: align(rtl) }]}>{label}</Text>
      {children}
    </View>
  );
}

function Choice({
  label,
  active,
  onPress,
  bg,
  fg,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  bg?: string;
  fg?: string;
}) {
  const { c, ui, chipPadding } = useTheme();
  const background = active ? bg ?? c.ink : 'transparent';
  const color = active ? fg ?? c.paper : c.ink2;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      android_ripple={null}
      style={{
        minWidth: 44,
        height: 34,
        paddingHorizontal: chipPadding + 2,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: active && !bg ? c.ink : active ? 'transparent' : c.rule,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[ui(13, 500), { color, lineHeight: undefined }]}>{label}</Text>
    </Pressable>
  );
}
