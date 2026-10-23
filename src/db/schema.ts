import type { SQLiteDatabase } from 'expo-sqlite';
import type { StringKey, Strings } from '../i18n/strings';
import type { Palette } from '../theme/palette';
import { splitTags } from '../lib/parse';

export const DB_NAME = 'daybook.db';

const SCHEMA_VERSION = 5;

export const DISPLAY_NAME = 'displayName';

export const LANG = 'lang';

export const APPEARANCE = 'appearance';

export const MOTION = 'motion';

export const ONBOARDED = 'onboarded';

export const CAPACITY = 'capacity';

export const DEFAULT_CAPACITY_MINUTES = 360;

export const CAPACITY_OPTIONS = [240, 360, 480] as const;

export const PRIORITY_HIGH = 3;

export const DEFAULT_TASK_COLOR: ColorToken = 'blue';

export const PROJECT_COLORS: ColorToken[] = ['blue', 'moss', 'och', 'ver'];

export type ColorToken = keyof Palette;

export type TaskRow = {
  id: string;
  title: string;
  seedKey: StringKey | null;
  notes: string | null;
  projectId: string | null;
  color: ColorToken;
  dueDate: number | null;
  createdAt: number;
  completedAt: number | null;
  snoozedUntil: number | null;
  deletedAt: number | null;
  duration: number | null;
  priority: number | null;
  sortOrder: number;
  reminderAt: number | null;
  tags: string | null;
  carryCount: number;
  somedayAt: number | null;
};

export type DatedTask = TaskRow & { dueDate: number };

export type Outcome = 'settled' | 'carried' | 'struck' | 'rescheduled' | 'shelved';

export type ClosedDayRow = {
  day: number;
  closedAt: number;
  settled: number;
  carried: number;
  struck: number;
  rescheduled: number;
  shelved: number;
  committedMinutes: number;
  settledMinutes: number;
};

export type ClosedEntryRow = {
  day: number;
  taskId: string;
  title: string;
  seedKey: StringKey | null;
  outcome: Outcome;
};

export type ProjectRow = {
  id: string;
  name: string;
  seedKey: StringKey | null;
  color: ColorToken;
  createdAt: number;
  archivedAt: number | null;
};

export type SubtaskRow = {
  id: string;
  parentTaskId: string;
  title: string;
  seedKey: StringKey | null;
  completedAt: number | null;
  sortOrder: number;
};

export function rowTitle(row: { title: string; seedKey: StringKey | null }, t: Strings): string {
  return row.seedKey ? t[row.seedKey] : row.title;
}

export function projectName(project: ProjectRow, t: Strings): string {
  return project.seedKey ? t[project.seedKey] : project.name;
}

export function taskTags(task: { tags: string | null }): string[] {
  return task.tags ? task.tags.split(',') : [];
}

const DDL = `
CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  archivedAt INTEGER
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  seedKey TEXT,
  notes TEXT,
  projectId TEXT REFERENCES projects(id),
  color TEXT NOT NULL,
  dueDate INTEGER,
  createdAt INTEGER NOT NULL,
  completedAt INTEGER,
  snoozedUntil INTEGER,
  deletedAt INTEGER,
  duration INTEGER,
  priority INTEGER,
  sortOrder INTEGER NOT NULL,
  reminderAt INTEGER
);

CREATE TABLE subtasks (
  id TEXT PRIMARY KEY NOT NULL,
  parentTaskId TEXT NOT NULL REFERENCES tasks(id),
  title TEXT NOT NULL,
  seedKey TEXT,
  completedAt INTEGER,
  sortOrder INTEGER NOT NULL
);

CREATE INDEX tasks_dueDate ON tasks (dueDate) WHERE deletedAt IS NULL;
CREATE INDEX tasks_projectId ON tasks (projectId) WHERE deletedAt IS NULL;
CREATE INDEX subtasks_parentTaskId ON subtasks (parentTaskId, sortOrder);
`;

const V2 = `
ALTER TABLE tasks ADD COLUMN tags TEXT;
ALTER TABLE projects ADD COLUMN seedKey TEXT;
UPDATE projects SET seedKey = 'studio' WHERE id = 'seed-studio';
UPDATE tasks SET tags = 'design' WHERE seedKey IN ('projectBrief', 'moodboards', 'launchSite');
UPDATE tasks SET tags = 'invoice' WHERE seedKey = 'task1';
`;

const V3 = `
CREATE TABLE prefs (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

const V4 = `
ALTER TABLE tasks ADD COLUMN carryCount INTEGER NOT NULL DEFAULT 0;

CREATE TABLE closed_days (
  day INTEGER PRIMARY KEY NOT NULL,
  closedAt INTEGER NOT NULL,
  settled INTEGER NOT NULL,
  carried INTEGER NOT NULL,
  struck INTEGER NOT NULL,
  rescheduled INTEGER NOT NULL,
  committedMinutes INTEGER NOT NULL,
  settledMinutes INTEGER NOT NULL
);

CREATE TABLE closed_entries (
  day INTEGER NOT NULL REFERENCES closed_days(day),
  taskId TEXT NOT NULL,
  title TEXT NOT NULL,
  seedKey TEXT,
  outcome TEXT NOT NULL,
  PRIMARY KEY (day, taskId)
);
`;

async function liftTagsFromTitles(db: SQLiteDatabase): Promise<void> {
  const written = await db.getAllAsync<{ id: string; title: string }>(
    "SELECT id, title FROM tasks WHERE seedKey IS NULL AND title LIKE '%#%'"
  );

  for (const task of written) {
    const { title, tags } = splitTags(task.title);
    if (!tags.length) continue;
    await db.runAsync('UPDATE tasks SET title = $title, tags = $tags WHERE id = $id', {
      $title: title,
      $tags: tags.join(','),
      $id: task.id,
    });
  }
}

const V5 = `
ALTER TABLE tasks ADD COLUMN somedayAt INTEGER;

ALTER TABLE closed_days ADD COLUMN shelved INTEGER NOT NULL DEFAULT 0;

CREATE INDEX tasks_someday ON tasks (somedayAt) WHERE deletedAt IS NULL;
`;

const STEPS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  (db) => db.execAsync(DDL),
  async (db) => {
    await db.execAsync(V2);
    await liftTagsFromTitles(db);
  },
  (db) => db.execAsync(V3),
  (db) => db.execAsync(V4),
  (db) => db.execAsync(V5),
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  const pragma = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const from = pragma ? pragma.user_version : 0;
  if (from >= SCHEMA_VERSION) return;

  for (const step of STEPS.slice(from)) await step(db);
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
