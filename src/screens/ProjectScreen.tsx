import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { addDays, dayOfMonth, startOfDay, timeLabel } from '../lib/date';
import { tagColors } from '../lib/parse';
import { useStore } from '../state/store';
import { projectName, rowTitle, taskTags, type TaskRow as TaskRowData } from '../db/schema';
import { SEED_PROJECT_ID } from '../db/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { Ledger, SectionLabel, EmptyRules } from '../components/Ledger';
import { TaskRow } from '../components/TaskRow';
import { SwipeableRow } from '../components/SwipeableRow';
import { Chip } from '../components/Chip';
import { ProjectPickerSheet } from './ProjectPickerSheet';

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

function ProjectTaskRow({ task, onAssign }: { task: TaskRowData; onAssign: () => void }) {
  const { t } = useTheme();
  const { complete, remove } = useStore();
  const done = task.completedAt !== null;

  return (
    <SwipeableRow
      onComplete={() => complete(task.id, !done)}
      onDelete={() => remove(task.id)}
      onLongPress={onAssign}
    >
      <TaskRow
        title={rowTitle(task, t)}
        meta={rowMeta(task)}
        done={done}
        onToggle={() => complete(task.id, !done)}
        accessibilityActions={[
          { name: 'complete', label: t.done },
          { name: 'delete', label: t.delete },
          { name: 'assign', label: t.moveToProject },
        ]}
        onAccessibilityAction={(e) => {
          const action = e.nativeEvent.actionName;
          if (action === 'complete') complete(task.id, !done);
          if (action === 'delete') remove(task.id);
          if (action === 'assign') onAssign();
        }}
      />
    </SwipeableRow>
  );
}

function rowMeta(task: TaskRowData): string {
  if (task.dueDate === null) return '';
  return timeLabel(task.dueDate) || String(dayOfMonth(task.dueDate));
}

function unionTags(tasks: TaskRowData[]): string[] {
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
  const [picking, setPicking] = useState<TaskRowData | null>(null);

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
            <View
              style={{
                flex: 1,
                flexDirection: row(rtl),
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              {unionTags(tasks).map((tag) => {
                const tint = tagColors(tag, c);
                return <Chip key={tag} label={`#${tag}`} bg={tint.bg} fg={tint.fg} />;
              })}
            </View>
          </View>
        </View>

        <Ledger>
          {thisWeek.length ? <SectionLabel label={t.thisWeek} /> : null}
          {thisWeek.map((task) => (
            <ProjectTaskRow key={task.id} task={task} onAssign={() => setPicking(task)} />
          ))}

          {later.length ? <SectionLabel label={`${t.later} · ${later.length}`} /> : null}
          {later.map((task) => (
            <ProjectTaskRow key={task.id} task={task} onAssign={() => setPicking(task)} />
          ))}

          <EmptyRules count={3} />
        </Ledger>
      </ScrollView>

      {picking ? <ProjectPickerSheet task={picking} onClose={() => setPicking(null)} /> : null}
    </Screen>
  );
}
