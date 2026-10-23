import React, { useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { useNote, useStore } from '../state/store';
import { CHECKBOX_MARK, type NoteLineRow, type TaskRow } from '../db/schema';
import { Screen, useHeaderTop, useScreenBottom } from '../components/Screen';
import { Checkbox, Ledger, useRuling } from '../components/Ledger';
import { pageLink } from '../lib/share';
import { ChevronBackIcon, PaperclipIcon, PlusIcon } from '../components/Icon';

function NoteLine({
  line,
  task,
  onChange,
  onPromote,
  onDemote,
  onToggle,
  onRemove,
  onSplit,
}: {
  line: NoteLineRow;
  task: TaskRow | undefined;
  onChange: (text: string) => void;
  onPromote: (text: string) => void;
  onDemote: () => void;
  onToggle: () => void;
  onRemove: () => void;
  onSplit: () => void;
}) {
  const { c, ui, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  const [text, setText] = useState(line.text);
  const done = task?.completedAt != null;

  const commit = () => {
    const trimmed = text.trim();
    if (trimmed === line.text) return;
    if (!trimmed && !line.taskId) {
      onRemove();
      return;
    }
    onChange(trimmed);
  };

  const type = (next: string) => {
    if (!line.taskId && CHECKBOX_MARK.test(next)) {
      const stripped = next.replace(CHECKBOX_MARK, '');
      setText(stripped);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPromote(stripped);
      return;
    }
    setText(next);
  };

  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View
        onLayout={onContentLayout}
        style={[
          {
            flexDirection: row(rtl),
            alignItems: 'center',
            paddingVertical: metrics.rowPad,
          },
          pad(rtl, 16, metrics.gutter),
        ]}
      >
        {line.taskId ? (
          <Pressable
            onPress={onToggle}
            onLongPress={onDemote}
            hitSlop={metrics.hitSlop}
            android_ripple={null}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={line.text}
          >
            <Checkbox checked={done} />
          </Pressable>
        ) : null}

        <TextInput
          value={text}
          onChangeText={type}
          onBlur={commit}
          onSubmitEditing={() => {
            commit();
            onSplit();
          }}
          blurOnSubmit={false}
          returnKeyType="next"
          selectionColor={c.ink}
          accessibilityLabel={line.text}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(17, 400, 22),
            line.taskId ? marginStart(rtl, 16) : null,
            {
              flex: 1,
              minWidth: 0,
              padding: 0,
              color: done ? c.ink3 : c.ink,
              textAlign: align(rtl),
              textDecorationLine: done ? 'line-through' : 'none',
            },
          ]}
        />
      </View>
    </View>
  );
}

export function NoteScreen({
  noteId,
  onBack,
  onOpenTask,
}: {
  noteId: string;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const { c, t, ui, mono, display, rtl } = useTheme();
  const { note, lines, tasks, audio } = useNote(noteId);
  const {
    renameNote,
    addLine,
    editLine,
    removeLine,
    promoteLine,
    demoteLine,
    complete,
  } = useStore();
  const top = useHeaderTop();
  const bottom = useScreenBottom();
  const [title, setTitle] = useState<string | null>(null);

  if (!note) return <Screen />;

  const taskFor = (line: NoteLineRow) =>
    line.taskId ? tasks.find((task) => task.id === line.taskId) : undefined;
  const open = tasks.filter((task) => task.completedAt === null).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <View
            style={{
              flexDirection: row(rtl),
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t.back}
              android_ripple={null}
              style={{
                width: metrics.minTap,
                height: metrics.minTap,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronBackIcon color={c.ink2} flip={rtl} />
            </Pressable>

            <Pressable
              onPress={() =>
                Share.share({
                  message: `${note.title}\n${pageLink(
                    note.title,
                    lines.map((line) => line.text)
                  )}`,
                })
              }
              hitSlop={metrics.hitSlop}
              android_ripple={null}
              accessibilityRole="button"
              accessibilityLabel={t.sharePage}
            >
              <Text style={[mono(12, 500, 0.1), { color: c.ink2 }]}>{t.sharePage}</Text>
            </Pressable>
          </View>

          <TextInput
            value={title ?? note.title}
            onChangeText={setTitle}
            onBlur={() => {
              const next = (title ?? '').trim();
              if (next && next !== note.title) renameNote(note.id, next);
              setTitle(null);
            }}
            selectionColor={c.ink}
            accessibilityLabel={t.noteTitle}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              display(40, { lineHeight: 44 }),
              { color: c.ink, padding: 0, textAlign: align(rtl) },
            ]}
          />

          <Text style={[mono(12, 500, 0.1), { color: c.ink3, marginTop: 4, textAlign: align(rtl) }]}>
            {tasks.length
              ? t.openOfLines
                  .replace('{open}', String(open))
                  .replace('{total}', String(tasks.length))
              : t.checkboxHint}
          </Text>
        </View>

        <Ledger>
          {lines.map((line, i) => (
            <NoteLine
              key={line.id}
              line={line}
              task={taskFor(line)}
              onChange={(text) => editLine(line.id, text)}
              onPromote={(text) => promoteLine(line.id, text)}
              onDemote={() => demoteLine(line.id)}
              onToggle={() => {
                const task = taskFor(line);
                if (task) complete(task.id, task.completedAt === null);
              }}
              onRemove={() => removeLine(line.id)}
              onSplit={() => addLine(note.id, '', line.sortOrder)}
            />
          ))}

          <Pressable
            onPress={() => addLine(note.id, '', lines.length ? lines[lines.length - 1].sortOrder : 0)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.addLine}
            style={({ pressed }) => ({
              minHeight: metrics.ruling,
              justifyContent: 'center',
              backgroundColor: pressed ? c.paper2 : 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: c.rule,
            })}
          >
            <View
              style={[
                { flexDirection: row(rtl), alignItems: 'center', gap: 10 },
                pad(rtl, 16, metrics.gutter),
              ]}
            >
              <PlusIcon size={18} color={c.ink3} />
              <Text style={[ui(15), { color: c.ink3 }]}>{t.addLine}</Text>
            </View>
          </Pressable>
        </Ledger>

        {audio.length ? (
          <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 20, gap: 6 }}>
            <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.attachment}
            </Text>
            {audio.map((file) => (
              <View
                key={file.id}
                style={{
                  flexDirection: row(rtl),
                  alignItems: 'center',
                  gap: 10,
                  minHeight: metrics.minTap,
                }}
              >
                <PaperclipIcon size={18} color={c.ink3} />
                <Text style={[ui(15), { color: c.ink2 }]}>
                  {t.audioOf.replace('{s}', String(Math.round(file.durationMs / 1000)))}
                </Text>
                <Text style={[mono(12, 500), { color: c.ink3 }]}>
                  {Math.max(1, Math.round(file.bytes / 1024))} KB
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {tasks.length ? (
          <View style={{ paddingHorizontal: metrics.gutter, paddingTop: 20, gap: 6 }}>
            <Text style={[mono(11, 500, 0.1), { color: c.ink3, textAlign: align(rtl) }]}>
              {t.linesAreTasks}
            </Text>
            {tasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => onOpenTask(task.id)}
                android_ripple={null}
                accessibilityRole="button"
                accessibilityLabel={task.title}
                style={{ minHeight: metrics.minTap, justifyContent: 'center' }}
              >
                <Text numberOfLines={1} style={[ui(15), { color: c.ink2, textAlign: align(rtl) }]}>
                  {task.title}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
