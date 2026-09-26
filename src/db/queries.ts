import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import { addDays, startOfDay, startOfMonth, startOfNextMonth } from '../lib/date';
import { snoozeUntil, type SnoozeOffset } from './reminders';
import { DEFAULT_TASK_COLOR, type DatedTask, type SubtaskRow, type TaskRow } from './schema';

export type NewTask = {
  title: string;
  dueDate: number | null;
  priority: number | null;
};

export type TaskPatch = {
  title?: string;
  notes?: string | null;
  projectId?: string | null;
  dueDate?: number | null;
  duration?: number | null;
  priority?: number | null;
  reminderAt?: number | null;
};

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function selectToday(db: SQLiteDatabase, now: number): Promise<DatedTask[]> {
  return db.getAllAsync<DatedTask>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND dueDate IS NOT NULL
        AND dueDate < $dayEnd
        AND (snoozedUntil IS NULL OR snoozedUntil <= $now)
        AND (dueDate >= $dayStart OR completedAt IS NULL)
      ORDER BY sortOrder`,
    { $now: now, $dayStart: startOfDay(now), $dayEnd: startOfDay(addDays(now, 1)) }
  );
}

export function selectUpcoming(db: SQLiteDatabase, now: number): Promise<DatedTask[]> {
  return db.getAllAsync<DatedTask>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND dueDate >= $dayEnd
      ORDER BY dueDate, sortOrder`,
    { $dayEnd: startOfDay(addDays(now, 1)) }
  );
}

export function selectInbox(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND dueDate IS NULL
        AND projectId IS NULL
      ORDER BY sortOrder`
  );
}

export function selectProject(db: SQLiteDatabase, projectId: string): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL AND projectId = $projectId
      ORDER BY dueDate IS NULL, dueDate, sortOrder`,
    { $projectId: projectId }
  );
}

export function selectMonth(db: SQLiteDatabase, now: number): Promise<DatedTask[]> {
  return db.getAllAsync<DatedTask>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND dueDate >= $from
        AND dueDate < $to
      ORDER BY dueDate, sortOrder`,
    { $from: startOfMonth(now), $to: startOfNextMonth(now) }
  );
}

export function selectSubtasks(db: SQLiteDatabase, parentTaskId: string): Promise<SubtaskRow[]> {
  return db.getAllAsync<SubtaskRow>(
    'SELECT * FROM subtasks WHERE parentTaskId = $parentTaskId ORDER BY sortOrder',
    { $parentTaskId: parentTaskId }
  );
}

export async function insertTask(db: SQLiteDatabase, task: NewTask, now: number): Promise<void> {
  const tail = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sortOrder), 0) + 1 AS next FROM tasks'
  );
  await db.runAsync(
    `INSERT INTO tasks (id, title, color, dueDate, createdAt, priority, sortOrder)
      VALUES ($id, $title, $color, $dueDate, $createdAt, $priority, $sortOrder)`,
    {
      $id: newId(),
      $title: task.title,
      $color: DEFAULT_TASK_COLOR,
      $dueDate: task.dueDate,
      $createdAt: now,
      $priority: task.priority,
      $sortOrder: tail ? tail.next : 1,
    }
  );
}

export async function updateTask(
  db: SQLiteDatabase,
  id: string,
  patch: TaskPatch
): Promise<void> {
  const fields = Object.keys(patch) as (keyof TaskPatch)[];
  if (!fields.length) return;

  const params: Record<string, SQLiteBindValue> = { $id: id };
  for (const field of fields) params[`$${field}`] = patch[field] ?? null;

  const assignments = fields.map((field) => `${field} = $${field}`).join(', ');
  await db.runAsync(`UPDATE tasks SET ${assignments} WHERE id = $id`, params);
}

export async function setTaskCompleted(
  db: SQLiteDatabase,
  id: string,
  completedAt: number | null
): Promise<void> {
  await db.runAsync('UPDATE tasks SET completedAt = $completedAt WHERE id = $id', {
    $completedAt: completedAt,
    $id: id,
  });
}

export async function setSubtaskCompleted(
  db: SQLiteDatabase,
  id: string,
  completedAt: number | null
): Promise<void> {
  await db.runAsync('UPDATE subtasks SET completedAt = $completedAt WHERE id = $id', {
    $completedAt: completedAt,
    $id: id,
  });
}

export async function snoozeTask(
  db: SQLiteDatabase,
  id: string,
  offset: SnoozeOffset,
  now: number
): Promise<void> {
  await db.runAsync('UPDATE tasks SET snoozedUntil = $snoozedUntil WHERE id = $id', {
    $snoozedUntil: snoozeUntil(offset, now),
    $id: id,
  });
}

export async function deleteTask(db: SQLiteDatabase, id: string, now: number): Promise<void> {
  await db.runAsync('UPDATE tasks SET deletedAt = $deletedAt WHERE id = $id', {
    $deletedAt: now,
    $id: id,
  });
}

export async function restoreTask(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE tasks SET deletedAt = NULL WHERE id = $id', { $id: id });
}
