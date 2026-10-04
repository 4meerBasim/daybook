import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Attachment, Entry, Journal, Project, SmartList, Subtask, Task } from '../data/seed';
import type { FocusSession, Habit } from '../state/store';
import type { JournalPrefs } from './db';
import type { Strings } from '../i18n/strings';

export type ExportFormat = 'json' | 'markdown';

export type ExportData = {
  tasks: Task[];
  projects: Project[];
  entries: Entry[];
  journals: Journal[];
  habits: Habit[];
  subtasks: Subtask[];
  smartLists: SmartList[];
  attachments: Attachment[];
  focusSessions: FocusSession[];
  prefs: JournalPrefs;
  done: Record<string, boolean>;
};

export function buildJsonExport(data: ExportData): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      tasks: data.tasks.map((k) => ({ ...k, done: !!data.done[k.id] })),
      projects: data.projects,
      entries: data.entries,
      journals: data.journals,
      habits: data.habits,
      subtasks: data.subtasks,
      smartLists: data.smartLists,
      attachments: data.attachments.map((a) => ({
        id: a.id,
        taskId: a.taskId,
        entryId: a.entryId,
        kind: a.kind,
        uri: a.uri,
        durationMs: a.durationMs,
        width: a.width,
        height: a.height,
        createdAt: a.createdAt,
      })),
      focusSessions: data.focusSessions,
      prefs: data.prefs,
    },
    null,
    2
  );
}

export function buildMarkdownExport(data: ExportData, t: Strings): string {
  const lines: string[] = [];
  lines.push(`# ${t.brand}`, '', `_${new Date().toISOString()}_`, '');

  lines.push(`## ${t.journals}`, '');
  const sortedEntries = [...data.entries].sort((a, b) => a.day.localeCompare(b.day));
  for (const journal of data.journals) {
    const journalEntries = sortedEntries.filter((e) => e.journalId === journal.id);
    if (!journalEntries.length) continue;
    lines.push(`### ${journal.name}`, '');
    for (const e of journalEntries) {
      const title = e.title.trim() || t.newEntry;
      lines.push(`#### ${e.day} — ${title}`, '');
      if (e.body.trim()) lines.push(e.body.trim(), '');
    }
  }

  lines.push(`## ${t.searchTasks}`, '');
  const groupName = (k: Task): string => {
    if (k.projectId) {
      const p = data.projects.find((pr) => pr.id === k.projectId);
      if (p) return p.name;
    }
    return k.list === 'inbox' ? t.inbox : t.today;
  };
  const groups = new Map<string, Task[]>();
  for (const k of data.tasks) {
    const key = groupName(k);
    const arr = groups.get(key);
    if (arr) arr.push(k);
    else groups.set(key, [k]);
  }
  groups.forEach((arr, name) => {
    lines.push(`### ${name}`, '');
    for (const k of arr) {
      const box = data.done[k.id] ? '[x]' : '[ ]';
      const meta = k.meta ? ` (${k.meta})` : '';
      lines.push(`- ${box} ${k.title}${meta}`);
      const subs = data.subtasks
        .filter((s) => s.taskId === k.id)
        .sort((a, b) => a.position - b.position);
      for (const s of subs) lines.push(`  - ${s.done ? '[x]' : '[ ]'} ${s.title}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

export async function exportData(
  format: ExportFormat,
  data: ExportData,
  t: Strings
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;
    const content = format === 'json' ? buildJsonExport(data) : buildMarkdownExport(data, t);
    const name = `daybook-export-${Date.now()}.${format === 'json' ? 'json' : 'md'}`;
    const file = new File(Paths.cache, name);
    file.create({ overwrite: true });
    file.write(content);
    await Sharing.shareAsync(file.uri, {
      mimeType: format === 'json' ? 'application/json' : 'text/markdown',
      UTI: format === 'json' ? 'public.json' : 'net.daringfireball.markdown',
      dialogTitle: format === 'json' ? t.exportJson : t.exportMarkdown,
    });
    return true;
  } catch {
    return false;
  }
}
