import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import type {
  Attachment,
  ColorKey,
  Entry,
  EntryTemplate,
  Journal,
  ListKey,
  Priority,
  Project,
  SmartList,
  SmartListRule,
  Status,
  Subtask,
  Task,
} from '../data/seed';
import { DEFAULT_JOURNAL_ID } from '../data/seed';
import type { RecurrenceRule } from './recurrence';
import type { JournalIconKey } from '../components/Icon';
import type { FocusSession, Habit, HabitSession } from '../state/store';
import type { Appearance, Lang, Motion } from '../theme/ThemeProvider';
import { newId } from './id';

export type SettingsSnapshot = { lang: Lang; appearance: Appearance; motion: Motion };

export type JournalPrefs = {
  currentJournalId: string;
  contextEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  onThisDayEnabled: boolean;
  deviceCalendarEnabled: boolean;
  deviceCalendarIds: string[];
  appLockEnabled: boolean;
  syncEnabled: boolean;
  syncOwnerId: string;
  lastSyncAt: number;
};

export type StoreSnapshot = {
  done: Record<string, boolean>;
  cleared: Record<string, boolean>;
  added: Task[];
  addedProjects: Project[];
  addedHabits: Habit[];
  habitSessions: HabitSession[];
  focusSessions: FocusSession[];
  journals: Journal[];
  entries: Entry[];
  templates: EntryTemplate[];
  subtasks: Subtask[];
  smartLists: SmartList[];
  attachments: Attachment[];
  prefs: JournalPrefs;
};

export const DEFAULT_PREFS: JournalPrefs = {
  currentJournalId: DEFAULT_JOURNAL_ID,
  contextEnabled: false,
  reminderEnabled: false,
  reminderTime: '20:00',
  onThisDayEnabled: false,
  deviceCalendarEnabled: false,
  deviceCalendarIds: [],
  appLockEnabled: false,
  syncEnabled: false,
  syncOwnerId: '',
  lastSyncAt: 0,
};

export type Snapshot = { settings: SettingsSnapshot; store: StoreSnapshot };

const DB_NAME = 'daybook.db';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  meta TEXT NOT NULL,
  list TEXT NOT NULL,
  projectId TEXT,
  "over" INTEGER,
  later INTEGER,
  "desc" TEXT,
  priority TEXT,
  status TEXT,
  dueAt INTEGER,
  reminderAt INTEGER,
  recurrence TEXT,
  color TEXT,
  urgent INTEGER,
  important INTEGER,
  someday INTEGER,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS task_tags (
  taskId TEXT NOT NULL,
  tag TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER,
  PRIMARY KEY (taskId, tag)
);

CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags (tag);

CREATE TABLE IF NOT EXISTS task_state (
  taskId TEXT PRIMARY KEY NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  cleared INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  streak INTEGER NOT NULL,
  minutes INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS habit_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  habitId TEXT NOT NULL,
  startedAt INTEGER NOT NULL,
  seconds INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  taskId TEXT,
  startedAt INTEGER NOT NULL,
  seconds INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_started ON focus_sessions (startedAt);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY NOT NULL,
  journalId TEXT NOT NULL,
  day TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  templateId TEXT,
  placeName TEXT,
  lat REAL,
  lng REAL,
  tempC REAL,
  weatherCode INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_entries_day ON entries (day);
CREATE INDEX IF NOT EXISTS idx_entries_journal ON entries (journalId);

CREATE TABLE IF NOT EXISTS entry_templates (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY NOT NULL,
  taskId TEXT NOT NULL,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks (taskId);

CREATE TABLE IF NOT EXISTS smart_lists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  rules TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  builtin INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY NOT NULL,
  taskId TEXT,
  entryId TEXT,
  kind TEXT NOT NULL,
  uri TEXT NOT NULL,
  durationMs INTEGER,
  width INTEGER,
  height INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deletedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_attachments_task ON attachments (taskId);
CREATE INDEX IF NOT EXISTS idx_attachments_entry ON attachments (entryId);
`;

const USER_VERSION = 2;

const TASK_COLUMNS_V1: { name: string; type: string }[] = [
  { name: 'dueAt', type: 'INTEGER' },
  { name: 'reminderAt', type: 'INTEGER' },
  { name: 'recurrence', type: 'TEXT' },
  { name: 'color', type: 'TEXT' },
  { name: 'urgent', type: 'INTEGER' },
  { name: 'important', type: 'INTEGER' },
  { name: 'someday', type: 'INTEGER' },
];

type TaskRow = {
  id: string;
  title: string;
  meta: string;
  list: string;
  projectId: string | null;
  over: number | null;
  later: number | null;
  desc: string | null;
  priority: string | null;
  status: string | null;
  dueAt: number | null;
  reminderAt: number | null;
  recurrence: string | null;
  color: string | null;
  urgent: number | null;
  important: number | null;
  someday: number | null;
};

type TagRow = { taskId: string; tag: string };
type StateRow = { taskId: string; done: number; cleared: number };
type ProjectRow = { id: string; name: string; color: string };
type HabitRow = { id: string; name: string; streak: number; minutes: number };
type SessionRow = { habitId: string; startedAt: number; seconds: number };
type FocusSessionRow = { id: string; taskId: string | null; startedAt: number; seconds: number };
type SettingRow = { key: string; value: string };
type JournalRow = { id: string; name: string; color: string; icon: string };
type EntryRow = {
  id: string;
  journalId: string;
  day: string;
  title: string;
  body: string;
  templateId: string | null;
  placeName: string | null;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  weatherCode: number | null;
  createdAt: number;
};
type TemplateRow = { id: string; name: string; body: string };
type SubtaskRow = { id: string; taskId: string; title: string; done: number; position: number };
type SmartListRow = {
  id: string;
  name: string;
  rules: string;
  position: number;
  builtin: number;
};
type AttachmentRow = {
  id: string;
  taskId: string | null;
  entryId: string | null;
  kind: string;
  uri: string;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  createdAt: number;
};

function rowToFocusSession(row: FocusSessionRow): FocusSession {
  return { id: row.id, taskId: row.taskId, startedAt: row.startedAt, seconds: row.seconds };
}

function rowToAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    taskId: row.taskId,
    entryId: row.entryId,
    kind: row.kind as Attachment['kind'],
    uri: row.uri,
    durationMs: row.durationMs,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt,
  };
}

let database: SQLiteDatabase | null = null;

function db(): SQLiteDatabase {
  if (!database) throw new Error('Database not initialized; call initDatabase() first');
  return database;
}

const now = () => Date.now();

// v2: entity ids moved from sequential per-device strings (`a{n}`, `p{n}`, …) to
// UUIDs so they no longer collide across devices under newer-wins sync. Seed /
// built-in ids (`t*`/`u*`/`i*` tasks, `studio`/`work`/`home` projects, `default`
// journal, `tpl-*` templates, `h1` habit) are deterministic and identical on every
// device, so they are left intact; only user-created rows are rewritten. The schema
// declares no FOREIGN KEY constraints, so ids and references are remapped by value.
async function buildIdMap(
  d: SQLiteDatabase,
  table: string,
  pattern: RegExp
): Promise<Map<string, string>> {
  const rows = await d.getAllAsync<{ id: string }>(`SELECT id FROM "${table}"`);
  const map = new Map<string, string>();
  for (const row of rows) {
    if (pattern.test(row.id)) map.set(row.id, newId());
  }
  return map;
}

async function migrateIdsToUuid(d: SQLiteDatabase): Promise<void> {
  const ts = now();
  const taskMap = await buildIdMap(d, 'tasks', /^a\d+$/);
  const projectMap = await buildIdMap(d, 'projects', /^p\d+$/);
  const habitMap = await buildIdMap(d, 'habits', /^g\d+$/);
  const journalMap = await buildIdMap(d, 'journals', /^j\d+$/);
  const entryMap = await buildIdMap(d, 'entries', /^e\d+$/);
  const templateMap = await buildIdMap(d, 'entry_templates', /^tpl-u\d+$/);
  const subtaskMap = await buildIdMap(d, 'subtasks', /^st\d+$/);
  const smartListMap = await buildIdMap(d, 'smart_lists', /^sl\d+$/);
  const attachmentMap = await buildIdMap(d, 'attachments', /^att\d+$/);
  const focusMap = await buildIdMap(d, 'focus_sessions', /^fs\d+$/);

  for (const [oldId, id] of taskMap) {
    await d.runAsync('UPDATE tasks SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE task_tags SET taskId = ?, updatedAt = ? WHERE taskId = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE task_state SET taskId = ?, updatedAt = ? WHERE taskId = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE subtasks SET taskId = ?, updatedAt = ? WHERE taskId = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE attachments SET taskId = ?, updatedAt = ? WHERE taskId = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE focus_sessions SET taskId = ?, updatedAt = ? WHERE taskId = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of projectMap) {
    await d.runAsync('UPDATE projects SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE tasks SET projectId = ?, updatedAt = ? WHERE projectId = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of habitMap) {
    await d.runAsync('UPDATE habits SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync(
      "UPDATE habit_sessions SET habitId = ?, id = ? || ':' || startedAt, updatedAt = ? WHERE habitId = ?",
      [id, id, ts, oldId]
    );
  }
  for (const [oldId, id] of journalMap) {
    await d.runAsync('UPDATE journals SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE entries SET journalId = ?, updatedAt = ? WHERE journalId = ?', [id, ts, oldId]);
    await d.runAsync("UPDATE settings SET value = ?, updatedAt = ? WHERE key = 'currentJournalId' AND value = ?", [id, ts, oldId]);
  }
  for (const [oldId, id] of templateMap) {
    await d.runAsync('UPDATE entry_templates SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE entries SET templateId = ?, updatedAt = ? WHERE templateId = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of entryMap) {
    await d.runAsync('UPDATE entries SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
    await d.runAsync('UPDATE attachments SET entryId = ?, updatedAt = ? WHERE entryId = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of subtaskMap) {
    await d.runAsync('UPDATE subtasks SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of attachmentMap) {
    await d.runAsync('UPDATE attachments SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of focusMap) {
    await d.runAsync('UPDATE focus_sessions SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
  }
  for (const [oldId, id] of smartListMap) {
    await d.runAsync('UPDATE smart_lists SET id = ?, updatedAt = ? WHERE id = ?', [id, ts, oldId]);
  }
  if (projectMap.size) {
    const lists = await d.getAllAsync<{ id: string; rules: string }>('SELECT id, rules FROM smart_lists');
    for (const l of lists) {
      try {
        const parsed = JSON.parse(l.rules) as SmartListRule;
        if (typeof parsed.projectId === 'string' && projectMap.has(parsed.projectId)) {
          parsed.projectId = projectMap.get(parsed.projectId) as string;
          await d.runAsync('UPDATE smart_lists SET rules = ?, updatedAt = ? WHERE id = ?', [
            JSON.stringify(parsed),
            ts,
            l.id,
          ]);
        }
      } catch {
        // malformed rules JSON — leave as-is
      }
    }
  }
}

async function migrate(d: SQLiteDatabase): Promise<void> {
  const row = await d.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= USER_VERSION) return;

  if (version < 1) {
    const columns = await d.getAllAsync<{ name: string }>('PRAGMA table_info(tasks)');
    const existing = new Set(columns.map((c) => c.name));
    for (const col of TASK_COLUMNS_V1) {
      if (!existing.has(col.name)) {
        await d.execAsync(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type}`);
      }
    }
  }

  if (version < 2) {
    await d.withTransactionAsync(async () => {
      await migrateIdsToUuid(d);
    });
  }

  await d.execAsync(`PRAGMA user_version = ${USER_VERSION}`);
}

export async function initDatabase(): Promise<void> {
  if (database) return;
  const opened = await openDatabaseAsync(DB_NAME);
  await opened.execAsync(SCHEMA);
  await migrate(opened);
  database = opened;
}

const EMPTY_SNAPSHOT: Snapshot = {
  settings: { lang: 'en', appearance: 'light', motion: 'full' },
  store: {
    done: {},
    cleared: {},
    added: [],
    addedProjects: [],
    addedHabits: [],
    habitSessions: [],
    focusSessions: [],
    journals: [],
    entries: [],
    templates: [],
    subtasks: [],
    smartLists: [],
    attachments: [],
    prefs: DEFAULT_PREFS,
  },
};

export async function bootstrapPersistence(): Promise<Snapshot> {
  try {
    await initDatabase();
    return await loadSnapshot();
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export async function loadSnapshot(): Promise<Snapshot> {
  const d = db();
  const [
    settingRows,
    stateRows,
    taskRows,
    tagRows,
    projectRows,
    habitRows,
    sessionRows,
    focusSessionRows,
    journalRows,
    entryRows,
    templateRows,
    subtaskRows,
    smartListRows,
    attachmentRows,
  ] = await Promise.all([
    d.getAllAsync<SettingRow>('SELECT key, value FROM settings'),
    d.getAllAsync<StateRow>('SELECT taskId, done, cleared FROM task_state WHERE deletedAt IS NULL'),
    d.getAllAsync<TaskRow>('SELECT * FROM tasks WHERE deletedAt IS NULL ORDER BY rowid'),
    d.getAllAsync<TagRow>('SELECT taskId, tag FROM task_tags WHERE deletedAt IS NULL ORDER BY rowid'),
    d.getAllAsync<ProjectRow>('SELECT * FROM projects WHERE deletedAt IS NULL ORDER BY rowid'),
    d.getAllAsync<HabitRow>('SELECT * FROM habits WHERE deletedAt IS NULL ORDER BY rowid'),
    d.getAllAsync<SessionRow>(
      'SELECT habitId, startedAt, seconds FROM habit_sessions WHERE deletedAt IS NULL ORDER BY rowid'
    ),
    d.getAllAsync<FocusSessionRow>(
      'SELECT id, taskId, startedAt, seconds FROM focus_sessions WHERE deletedAt IS NULL ORDER BY startedAt'
    ),
    d.getAllAsync<JournalRow>(
      'SELECT id, name, color, icon FROM journals WHERE deletedAt IS NULL ORDER BY rowid'
    ),
    d.getAllAsync<EntryRow>('SELECT * FROM entries WHERE deletedAt IS NULL ORDER BY createdAt'),
    d.getAllAsync<TemplateRow>(
      'SELECT id, name, body FROM entry_templates WHERE deletedAt IS NULL ORDER BY rowid'
    ),
    d.getAllAsync<SubtaskRow>(
      'SELECT id, taskId, title, done, position FROM subtasks WHERE deletedAt IS NULL ORDER BY position'
    ),
    d.getAllAsync<SmartListRow>(
      'SELECT id, name, rules, position, builtin FROM smart_lists WHERE deletedAt IS NULL ORDER BY position'
    ),
    d.getAllAsync<AttachmentRow>(
      'SELECT id, taskId, entryId, kind, uri, durationMs, width, height, createdAt FROM attachments WHERE deletedAt IS NULL ORDER BY createdAt'
    ),
  ]);

  const settingMap = new Map(settingRows.map((r) => [r.key, r.value]));
  const flag = (key: string, fallback: boolean) => {
    const v = settingMap.get(key);
    return v == null ? fallback : v === '1';
  };

  const done: Record<string, boolean> = {};
  const cleared: Record<string, boolean> = {};
  for (const row of stateRows) {
    if (row.done) done[row.taskId] = true;
    if (row.cleared) cleared[row.taskId] = true;
  }

  const tagsByTask = new Map<string, string[]>();
  for (const row of tagRows) {
    const list = tagsByTask.get(row.taskId);
    if (list) list.push(row.tag);
    else tagsByTask.set(row.taskId, [row.tag]);
  }

  return {
    settings: {
      lang: (settingMap.get('lang') as Lang) ?? 'en',
      appearance: (settingMap.get('appearance') as Appearance) ?? 'light',
      motion: (settingMap.get('motion') as Motion) ?? 'full',
    },
    store: {
      done,
      cleared,
      added: taskRows.map((row) => rowToTask(row, tagsByTask.get(row.id))),
      addedProjects: projectRows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color as Project['color'],
      })),
      addedHabits: habitRows.map((row) => ({
        id: row.id,
        name: row.name,
        streak: row.streak,
        minutes: row.minutes,
      })),
      habitSessions: sessionRows.map((row) => ({
        habitId: row.habitId,
        startedAt: row.startedAt,
        seconds: row.seconds,
      })),
      focusSessions: focusSessionRows.map(rowToFocusSession),
      journals: journalRows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color as Journal['color'],
        icon: row.icon as JournalIconKey,
      })),
      entries: entryRows.map((row) => ({
        id: row.id,
        journalId: row.journalId,
        day: row.day,
        title: row.title,
        body: row.body,
        templateId: row.templateId,
        createdAt: row.createdAt,
        placeName: row.placeName,
        lat: row.lat,
        lng: row.lng,
        tempC: row.tempC,
        weatherCode: row.weatherCode,
      })),
      templates: templateRows.map((row) => ({
        id: row.id,
        name: row.name,
        body: row.body,
        builtIn: false,
      })),
      subtasks: subtaskRows.map((row) => ({
        id: row.id,
        taskId: row.taskId,
        title: row.title,
        done: !!row.done,
        position: row.position,
      })),
      smartLists: smartListRows.map((row) => ({
        id: row.id,
        name: row.name,
        rules: parseSmartListRules(row.rules),
        position: row.position,
        builtin: !!row.builtin,
      })),
      attachments: attachmentRows.map(rowToAttachment),
      prefs: {
        currentJournalId: settingMap.get('currentJournalId') ?? DEFAULT_PREFS.currentJournalId,
        contextEnabled: flag('contextEnabled', DEFAULT_PREFS.contextEnabled),
        reminderEnabled: flag('reminderEnabled', DEFAULT_PREFS.reminderEnabled),
        reminderTime: settingMap.get('reminderTime') ?? DEFAULT_PREFS.reminderTime,
        onThisDayEnabled: flag('onThisDayEnabled', DEFAULT_PREFS.onThisDayEnabled),
        deviceCalendarEnabled: flag('deviceCalendarEnabled', DEFAULT_PREFS.deviceCalendarEnabled),
        deviceCalendarIds: parseDeviceCalendarIds(settingMap.get('deviceCalendarIds')),
        appLockEnabled: flag('appLockEnabled', DEFAULT_PREFS.appLockEnabled),
        syncEnabled: flag('syncEnabled', DEFAULT_PREFS.syncEnabled),
        syncOwnerId: settingMap.get('syncOwnerId') ?? DEFAULT_PREFS.syncOwnerId,
        lastSyncAt: Number(settingMap.get('lastSyncAt') ?? 0) || 0,
      },
    },
  };
}

function parseDeviceCalendarIds(raw: string | undefined): string[] {
  if (raw == null) return DEFAULT_PREFS.deviceCalendarIds;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : DEFAULT_PREFS.deviceCalendarIds;
  } catch {
    return DEFAULT_PREFS.deviceCalendarIds;
  }
}

function parseSmartListRules(raw: string): SmartListRule {
  try {
    return JSON.parse(raw) as SmartListRule;
  } catch {
    return {};
  }
}

function parseRecurrence(raw: string | null): RecurrenceRule | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as RecurrenceRule;
  } catch {
    return null;
  }
}

function rowToTask(row: TaskRow, tags: string[] | undefined): Task {
  const task: Task = {
    id: row.id,
    title: row.title,
    meta: row.meta,
    list: row.list as ListKey,
    projectId: row.projectId,
  };
  if (row.over) task.over = true;
  if (row.later) task.later = true;
  if (row.desc != null) task.desc = row.desc;
  if (row.priority != null) task.priority = row.priority as Priority;
  if (row.status != null) task.status = row.status as Status;
  if (tags && tags.length) task.tags = tags;
  if (row.dueAt != null) task.dueAt = row.dueAt;
  if (row.reminderAt != null) task.reminderAt = row.reminderAt;
  if (row.recurrence != null) task.recurrence = parseRecurrence(row.recurrence);
  if (row.color != null) task.color = row.color as ColorKey;
  if (row.urgent != null) task.urgent = !!row.urgent;
  if (row.important != null) task.important = !!row.important;
  if (row.someday != null) task.someday = !!row.someday;
  return task;
}

export function upsertTask(task: Task): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO tasks (id, title, meta, list, projectId, "over", later, "desc", priority, status, dueAt, reminderAt, recurrence, color, urgent, important, someday, updatedAt, deletedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title, meta = excluded.meta, list = excluded.list, projectId = excluded.projectId,
       "over" = excluded."over", later = excluded.later, "desc" = excluded."desc",
       priority = excluded.priority, status = excluded.status,
       dueAt = excluded.dueAt, reminderAt = excluded.reminderAt, recurrence = excluded.recurrence,
       color = excluded.color, urgent = excluded.urgent, important = excluded.important, someday = excluded.someday,
       updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [
      task.id,
      task.title,
      task.meta,
      task.list,
      task.projectId,
      task.over ? 1 : 0,
      task.later ? 1 : 0,
      task.desc ?? null,
      task.priority ?? null,
      task.status ?? null,
      task.dueAt ?? null,
      task.reminderAt ?? null,
      task.recurrence != null ? JSON.stringify(task.recurrence) : null,
      task.color ?? null,
      task.urgent ? 1 : 0,
      task.important ? 1 : 0,
      task.someday ? 1 : 0,
      now(),
    ]
  );
}

export function deleteTaskRow(id: string): void {
  if (!database) return;
  const ts = now();
  void database.runAsync('UPDATE tasks SET deletedAt = ?, updatedAt = ? WHERE id = ?', [ts, ts, id]);
  void database.runAsync(
    'UPDATE task_state SET deletedAt = ?, updatedAt = ? WHERE taskId = ? AND deletedAt IS NULL',
    [ts, ts, id]
  );
  void database.runAsync(
    'UPDATE task_tags SET deletedAt = ?, updatedAt = ? WHERE taskId = ? AND deletedAt IS NULL',
    [ts, ts, id]
  );
}

export function upsertSubtask(s: Subtask): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO subtasks (id, taskId, title, done, position, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET taskId = excluded.taskId, title = excluded.title, done = excluded.done, position = excluded.position, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [s.id, s.taskId, s.title, s.done ? 1 : 0, s.position, now()]
  );
}

export function setSubtaskState(id: string, done: boolean): void {
  if (!database) return;
  void database.runAsync('UPDATE subtasks SET done = ?, updatedAt = ? WHERE id = ?', [
    done ? 1 : 0,
    now(),
    id,
  ]);
}

export function deleteSubtaskRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE subtasks SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function upsertSmartList(l: SmartList): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO smart_lists (id, name, rules, position, builtin, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, rules = excluded.rules, position = excluded.position, builtin = excluded.builtin, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [l.id, l.name, JSON.stringify(l.rules), l.position, l.builtin ? 1 : 0, now()]
  );
}

export function deleteSmartListRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE smart_lists SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function upsertAttachment(a: Attachment): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO attachments (id, taskId, entryId, kind, uri, durationMs, width, height, createdAt, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET taskId = excluded.taskId, entryId = excluded.entryId, kind = excluded.kind, uri = excluded.uri, durationMs = excluded.durationMs, width = excluded.width, height = excluded.height, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [a.id, a.taskId, a.entryId, a.kind, a.uri, a.durationMs, a.width, a.height, a.createdAt, now()]
  );
}

export function deleteAttachmentRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE attachments SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function setTaskTags(taskId: string, tags: string[]): void {
  const d = database;
  if (!d) return;
  const ts = now();
  void d.withTransactionAsync(async () => {
    await d.runAsync(
      'UPDATE task_tags SET deletedAt = ?, updatedAt = ? WHERE taskId = ? AND deletedAt IS NULL',
      [ts, ts, taskId]
    );
    for (const tag of tags) {
      await d.runAsync(
        `INSERT INTO task_tags (taskId, tag, updatedAt, deletedAt) VALUES (?, ?, ?, NULL)
         ON CONFLICT(taskId, tag) DO UPDATE SET updatedAt = excluded.updatedAt, deletedAt = NULL`,
        [taskId, tag, ts]
      );
    }
  });
}

export function setTaskState(taskId: string, done: boolean, cleared: boolean): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO task_state (taskId, done, cleared, updatedAt, deletedAt) VALUES (?, ?, ?, ?, NULL)
     ON CONFLICT(taskId) DO UPDATE SET done = excluded.done, cleared = excluded.cleared, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [taskId, done ? 1 : 0, cleared ? 1 : 0, now()]
  );
}

export function upsertProject(project: Project): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO projects (id, name, color, updatedAt, deletedAt) VALUES (?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [project.id, project.name, project.color, now()]
  );
}

export function upsertHabit(habit: Habit): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO habits (id, name, streak, minutes, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, streak = excluded.streak, minutes = excluded.minutes, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [habit.id, habit.name, habit.streak, habit.minutes, now()]
  );
}

export function addHabitSessionRow(session: HabitSession): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO habit_sessions (id, habitId, startedAt, seconds, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET seconds = excluded.seconds, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [`${session.habitId}:${session.startedAt}`, session.habitId, session.startedAt, session.seconds, now()]
  );
}

export function upsertFocusSession(s: FocusSession): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO focus_sessions (id, taskId, startedAt, seconds, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET taskId = excluded.taskId, startedAt = excluded.startedAt, seconds = excluded.seconds, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [s.id, s.taskId, s.startedAt, s.seconds, now()]
  );
}

export function deleteFocusSessionRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE focus_sessions SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function setSetting(key: string, value: string): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    [key, value, now()]
  );
}

export async function getChangedRows(
  table: string,
  since: number
): Promise<Record<string, unknown>[]> {
  if (!database) return [];
  return database.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM "${table}" WHERE updatedAt > ?`,
    [since]
  );
}

export async function applyRemoteRows(
  table: string,
  rows: Record<string, unknown>[],
  keys: string[] = ['id']
): Promise<void> {
  const d = database;
  if (!d || !rows.length) return;
  await d.withTransactionAsync(async () => {
    for (const row of rows) {
      const cols = Object.keys(row);
      if (!keys.every((k) => cols.includes(k)) || !cols.includes('updatedAt')) continue;
      const columnList = cols.map((c) => `"${c}"`).join(', ');
      const placeholders = cols.map(() => '?').join(', ');
      const assignments = cols
        .filter((c) => !keys.includes(c))
        .map((c) => `"${c}" = excluded."${c}"`)
        .join(', ');
      const conflict = keys.map((k) => `"${k}"`).join(', ');
      const values = cols.map((c) => {
        const v = row[c];
        return typeof v === 'boolean' ? (v ? 1 : 0) : (v as never);
      });
      await d.runAsync(
        `INSERT INTO "${table}" (${columnList}) VALUES (${placeholders})
         ON CONFLICT(${conflict}) DO UPDATE SET ${assignments}
         WHERE excluded.updatedAt > "${table}".updatedAt`,
        values
      );
    }
  });
}

export function upsertJournal(journal: Journal): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO journals (id, name, color, icon, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color, icon = excluded.icon, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [journal.id, journal.name, journal.color, journal.icon, now()]
  );
}

export function deleteJournalRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE journals SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function upsertEntry(entry: Entry): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO entries
       (id, journalId, day, title, body, templateId, placeName, lat, lng, tempC, weatherCode, createdAt, updatedAt, deletedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET
       journalId = excluded.journalId, day = excluded.day, title = excluded.title, body = excluded.body,
       templateId = excluded.templateId, placeName = excluded.placeName, lat = excluded.lat, lng = excluded.lng,
       tempC = excluded.tempC, weatherCode = excluded.weatherCode, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [
      entry.id,
      entry.journalId,
      entry.day,
      entry.title,
      entry.body,
      entry.templateId,
      entry.placeName,
      entry.lat,
      entry.lng,
      entry.tempC,
      entry.weatherCode,
      entry.createdAt,
      now(),
    ]
  );
}

export function deleteEntryRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE entries SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}

export function reassignEntriesJournal(fromJournalId: string, toJournalId: string): void {
  if (!database) return;
  void database.runAsync(
    'UPDATE entries SET journalId = ?, updatedAt = ? WHERE journalId = ? AND deletedAt IS NULL',
    [toJournalId, now(), fromJournalId]
  );
}

export function upsertEntryTemplate(template: EntryTemplate): void {
  if (!database) return;
  void database.runAsync(
    `INSERT INTO entry_templates (id, name, body, updatedAt, deletedAt) VALUES (?, ?, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, body = excluded.body, updatedAt = excluded.updatedAt, deletedAt = NULL`,
    [template.id, template.name, template.body, now()]
  );
}

export function deleteEntryTemplateRow(id: string): void {
  if (!database) return;
  void database.runAsync('UPDATE entry_templates SET deletedAt = ?, updatedAt = ? WHERE id = ?', [
    now(),
    now(),
    id,
  ]);
}
