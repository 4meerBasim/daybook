import React, { useState } from 'react';
import { LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, insetStart, marginStart, row } from '../lib/rtl';
import { addDays, dayOfMonth, startOfDay, timeLabel } from '../lib/date';
import { tagColors } from '../lib/parse';
import { useStore } from '../state/store';
import { projectName, rowTitle, taskTags, type TaskRow } from '../db/schema';
import { SEED_PROJECT_ID } from '../db/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { Checkbox, Ledger, SectionLabel, EmptyRules, rowContent, useRuling } from '../components/Ledger';
import { Chip } from '../components/Chip';

function Avatar({ initials, bg, first }: { initials: string; bg: string; first: boolean }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={[
        {
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: c.paper,
          alignItems: 'center',
          justifyContent: 'center',
        },
        first ? undefined : marginStart(rtl, -8),
      ]}
    >
      <Text style={[mono(11, 500), { color: c.paper }]}>{initials}</Text>
    </View>
  );
}

function ProjectTaskRow({ task }: { task: TaskRow }) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { height, grown, onContentLayout } = useRuling();
  const [textWidth, setTextWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width);
  const done = task.completedAt !== null;

  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <Checkbox checked={done} />

        <View style={[{ flex: 1, minWidth: 0, position: 'relative' }, marginStart(rtl, 16)]}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            onLayout={onLayout}
            style={[
              ui(17, 400, 22),
              { color: done ? c.ink3 : c.ink, textAlign: align(rtl) },
              done && grown ? { textDecorationLine: 'line-through' } : null,
            ]}
          >
            {rowTitle(task, t)}
          </Text>
          {done && !grown ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: '50%',
                height: 1.5,
                width: textWidth + 2,
                backgroundColor: c.ink,
                ...insetStart(rtl, -2),
              }}
            />
          ) : null}
        </View>

        <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
          {rowMeta(task)}
        </Text>
      </View>
    </View>
  );
}

function rowMeta(task: TaskRow): string {
  if (task.dueDate === null) return '';
  return timeLabel(task.dueDate) || String(dayOfMonth(task.dueDate));
}

function unionTags(tasks: TaskRow[]): string[] {
  const all: string[] = [];
  for (const task of tasks) {
    for (const tag of taskTags(task)) if (!all.includes(tag)) all.push(tag);
  }
  return all;
}

export function ProjectScreen({ projectId }: { projectId: string }) {
  const { c, t, display, ui, mono, rtl } = useTheme();
  const { projects, assigned } = useStore();
  const top = useHeaderTop();

  const project = projects.find((p) => p.id === projectId);
  if (!project) return <Screen />;

  const tasks = assigned.filter((k) => k.projectId === projectId);
  const doneCount = tasks.filter((k) => k.completedAt !== null).length;
  const weekEnd = startOfDay(addDays(Date.now(), 7));
  const thisWeek = tasks.filter((k) => k.dueDate !== null && k.dueDate < weekEnd);
  const later = tasks.filter((k) => k.dueDate === null || k.dueDate >= weekEnd);
  const collaborators = project.id === SEED_PROJECT_ID;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.gutter }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, gap: 6 }}>
          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c[project.color] }}
            />
            <Text style={[mono(12, 500, 0.1), { color: c.ink3 }]}>{t.project}</Text>
          </View>

          <View
            style={{
              flexDirection: row(rtl),
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                display(40, { lineHeight: 44 }),
                { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
              ]}
            >
              {projectName(project, t)}
            </Text>
            <Text style={[mono(22, 500), { color: c.ink2, paddingBottom: 4 }, marginStart(rtl, 12)]}>
              <Text style={{ color: c.ink }}>{doneCount}</Text> / {tasks.length}
            </Text>
          </View>

          <View
            style={{
              flexDirection: row(rtl),
              alignItems: 'center',
              gap: 10,
              paddingTop: 8,
              paddingBottom: 12,
            }}
          >
            {collaborators ? (
              <>
                <View style={{ flexDirection: row(rtl) }}>
                  <Avatar initials="LM" bg={c.ink} first />
                  <Avatar initials="NA" bg={c.moss} first={false} />
                </View>
                <Text style={[ui(13), { color: c.ink3 }]}>{t.shared}</Text>
              </>
            ) : null}
            <View style={{ flex: 1 }} />
            {unionTags(tasks).map((tag) => {
              const tint = tagColors(tag, c);
              return <Chip key={tag} label={`#${tag}`} bg={tint.bg} fg={tint.fg} />;
            })}
          </View>
        </View>

        <Ledger>
          {thisWeek.length ? <SectionLabel label={t.thisWeek} /> : null}
          {thisWeek.map((task) => (
            <ProjectTaskRow key={task.id} task={task} />
          ))}

          {later.length ? <SectionLabel label={`${t.later} · ${later.length}`} /> : null}
          {later.map((task) => (
            <ProjectTaskRow key={task.id} task={task} />
          ))}

          <EmptyRules count={3} />
        </Ledger>
      </ScrollView>
    </Screen>
  );
}
