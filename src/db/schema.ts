import type { SQLiteDatabase } from 'expo-sqlite';
import type { StringKey, Strings } from '../i18n/strings';
import type { Palette } from '../theme/palette';

export const DB_NAME = 'daybook.db';

const SCHEMA_VERSION = 1;

export const PRIORITY_HIGH = 3;

export const DEFAULT_TASK_COLOR: ColorToken = 'blue';

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
};

export type DatedTask = TaskRow & { dueDate: number };

export type ProjectRow = {
  id: string;
  name: string;
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

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  const pragma = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if (pragma && pragma.user_version >= SCHEMA_VERSION) return;

  await db.execAsync(DDL);
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
