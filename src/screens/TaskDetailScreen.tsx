import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, insetStart, marginStart, pad, row } from '../lib/rtl';
import { longDate, minutesLabel, timeLabel } from '../lib/date';
import { tagColors } from '../lib/parse';
import { useStore, useTaskDetail } from '../state/store';
import {
  PRIORITY_HIGH,
  projectName,
  rowTitle,
  taskTags,
  type SubtaskRow as SubtaskRowData,
} from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { Checkbox, rowContent, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';
import { Segmented } from '../components/Segmented';
import { ProjectPickerSheet } from './ProjectPickerSheet';
import { WaitingSheet } from '../components/WaitingSheet';
import { ChevronBackIcon, EllipsisIcon } from '../components/Icon';

function SubtaskRow({ task, onToggle }: { task: SubtaskRowData; onToggle: () => void }) {
  const { c, t, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  const checked = task.completedAt !== null;
  const label = rowTitle(task, t);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      android_ripple={null}
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <Checkbox checked={checked} />
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(15, 400, 22),
            marginStart(rtl, 16),
            {
              flex: 1,
              minWidth: 0,
              color: checked ? c.ink3 : c.ink,
              textAlign: align(rtl),
              textDecorationLine: checked ? 'line-through' : 'none',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const ESTIMATE_OPTIONS = [15, 30, 60, 120];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { c, mono, rtl, unit } = useTheme();
  return (
    <View
      style={[
        {
          minHeight: unit,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
        },
        pad(rtl, metrics.gutter, metrics.gutter),
      ]}
    >
      <Text
        style={[
          mono(11, 500, 0.1, true),
          { width: metrics.labelColumn, color: c.ink3, textAlign: align(rtl) },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

export function TaskDetailScreen({
  taskId,
  onBack,
  onFocus,
}: {
  taskId: string;
  onBack: () => void;
  onFocus: () => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { projects, complete, completeSubtask, edit, block, unblock } = useStore();
  const { task, subtasks } = useTaskDetail(taskId);
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const [filing, setFiling] = useState(false);
  const [blocking, setBlocking] = useState(false);

  if (!task) return <Screen />;

  const done = task.completedAt !== null;
  const project = projects.find((p) => p.id === task.projectId);
  const tags = taskTags(task);
  const doneCount = subtasks.filter((s) => s.completedAt !== null).length;
  const clock = timeLabel(task.dueDate);
  const estimate = task.duration === null ? 'none' : String(task.duration);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
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
          <Text style={[mono(12, 500, 0.1), { color: c.ink2 }]}>
            {project ? projectName(project, t) : ''}
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

        <View
          style={[
            {
              paddingTop: 20,
              paddingBottom: 16,
              flexDirection: row(rtl),
              gap: 14,
              alignItems: 'flex-start',
            },
            pad(rtl, metrics.gutter, metrics.gutter),
          ]}
        >
          <Pressable
            onPress={() => {
              if (!done) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              complete(task.id, !done);
            }}
            hitSlop={metrics.hitSlop}
            android_ripple={null}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={rowTitle(task, t)}
            style={{ marginTop: 6 }}
          >
            <Checkbox checked={done} size={26} />
          </Pressable>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              display(30, { lineHeight: 36 }),
              {
                flex: 1,
                color: done ? c.ink3 : c.ink,
                textAlign: align(rtl),
                textDecorationLine: done ? 'line-through' : 'none',
              },
            ]}
          >
            {rowTitle(task, t)}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
          <Field label={t.when}>
            {task.dueDate === null ? (
              <Text style={[ui(15), { lineHeight: undefined, color: c.ink3 }]}>{t.noDate}</Text>
            ) : (
              <Text style={[ui(15), { lineHeight: undefined, color: c.ink }]}>
                {longDate(task.dueDate, t)}
                {clock ? ' · ' : ''}
                {clock ? <Text style={mono(15)}>{clock}</Text> : null}
              </Text>
            )}
          </Field>

          <Field label={t.reminder}>
            <Text
              style={[
                ui(15),
                { lineHeight: undefined, color: task.reminderAt === null ? c.ink3 : c.ink },
              ]}
            >
              {task.reminderAt === null ? t.noReminder : timeLabel(task.reminderAt)}
            </Text>
          </Field>

          <Pressable
            onPress={() => setFiling(true)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.moveToProject}
          >
            <Field label={t.project}>
              <Text
                style={[
                  ui(15),
                  { lineHeight: undefined, color: project ? c.ink : c.ink3 },
                ]}
              >
                {project ? projectName(project, t) : t.noProject}
              </Text>
            </Field>
          </Pressable>

          <Pressable
            onPress={() => setBlocking(true)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.waitingOn}
          >
            <Field label={t.waitingOn}>
              <Text
                style={[ui(15), { lineHeight: undefined, color: task.blockedBy ? c.ink : c.ink3 }]}
              >
                {task.blockedBy ?? t.notWaiting}
              </Text>
              <View style={{ flex: 1 }} />
              {task.nudgeAt ? (
                <Text style={[mono(12, 500), { color: c.ink3 }]}>{longDate(task.nudgeAt, t)}</Text>
              ) : null}
            </Field>
          </Pressable>

          <Field label={t.estimate}>
            <Segmented
              options={[
                { key: 'none', label: t.estimateNone },
                ...ESTIMATE_OPTIONS.map((m) => ({ key: String(m), label: minutesLabel(m, t) })),
              ]}
              value={estimate}
              onChange={(next) =>
                edit(task.id, { duration: next === 'none' ? null : Number(next) })
              }
            />
          </Field>

          {task.priority === PRIORITY_HIGH || tags.length ? (
            <Field label={t.priority}>
              {task.priority === PRIORITY_HIGH ? (
                <Chip label={t.high} bg={c.verS} fg={c.ver} />
              ) : null}
              {tags.map((tag) => {
                const tint = tagColors(tag, c);
                return <Chip key={tag} label={`#${tag}`} bg={tint.bg} fg={tint.fg} />;
              })}
            </Field>
          ) : null}

          {subtasks.length ? (
            <>
              <Field label={t.subtasks}>
                <Text style={[mono(13, 500), { color: c.ink2 }]}>
                  {doneCount} / {subtasks.length}
                </Text>
              </Field>

              <View style={{ position: 'relative' }}>
                <View
                  pointerEvents="none"
                  style={[
                    {
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: c.ver,
                      opacity: 0.6,
                    },
                    insetStart(rtl, metrics.marginLine),
                  ]}
                />
                {subtasks.map((s) => (
                  <SubtaskRow
                    key={s.id}
                    task={s}
                    onToggle={() => completeSubtask(s.id, s.completedAt === null)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {task.notes ? (
            <View
              style={{
                paddingVertical: 14,
                paddingHorizontal: metrics.gutter,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
              }}
            >
              <Text
                style={[
                  mono(11, 500, 0.1),
                  { color: c.ink3, marginBottom: 6, textAlign: align(rtl) },
                ]}
              >
                {t.notes}
              </Text>
              <Text style={[ui(15, 400, 22), { color: c.ink2, textAlign: align(rtl) }]}>
                {task.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {filing ? <ProjectPickerSheet task={task} onClose={() => setFiling(false)} /> : null}

      {blocking ? (
        <WaitingSheet
          task={task}
          onClose={() => setBlocking(false)}
          onSubmit={(who, nudgeAt) => block(task.id, who, nudgeAt)}
          onClear={() => unblock(task.id)}
        />
      ) : null}
    </Screen>
  );
}
