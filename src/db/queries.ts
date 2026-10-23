import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import { addDays, startOfDay, startOfMonth, startOfNextMonth } from '../lib/date';
import { snoozeUntil, type SnoozeOffset } from './reminders';
import {
  DEFAULT_TASK_COLOR,
  type ClosedDayRow,
  type ClosedEntryRow,
  type ColorToken,
  type DatedTask,
  type Outcome,
  type ProjectRow,
  type SubtaskRow,
  type TaskRow,
} from './schema';

export type NewTask = {
  title: string;
  tags: string[];
  dueDate: number | null;
  duration: number | null;
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
  somedayAt?: number | null;
  retireAskedCarry?: number | null;
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
        AND (blockedBy IS NULL OR nudgeAt IS NULL OR nudgeAt <= $now)
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
        AND (blockedBy IS NULL OR nudgeAt IS NULL OR nudgeAt <= $now)
      ORDER BY dueDate, sortOrder`,
    { $now: now, $dayEnd: startOfDay(addDays(now, 1)) }
  );
}

export function selectAssigned(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL AND projectId IS NOT NULL
      ORDER BY dueDate IS NULL, dueDate, sortOrder`
  );
}

export function selectUnfiled(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND dueDate IS NULL
        AND projectId IS NULL
        AND somedayAt IS NULL
      ORDER BY sortOrder`
  );
}

export function selectDealable(db: SQLiteDatabase, now: number): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND somedayAt IS NULL
        AND (snoozedUntil IS NULL OR snoozedUntil <= $now)
        AND (blockedBy IS NULL OR nudgeAt IS NULL OR nudgeAt <= $now)
        AND (dueDate IS NULL OR dueDate < $dayEnd)
      ORDER BY sortOrder`,
    { $now: now, $dayEnd: startOfDay(addDays(now, 1)) }
  );
}

export function selectWaiting(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND blockedBy IS NOT NULL
      ORDER BY nudgeAt IS NULL, nudgeAt`
  );
}

export function selectSomeday(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND somedayAt IS NOT NULL
      ORDER BY somedayAt DESC`
  );
}

export function selectUndated(db: SQLiteDatabase): Promise<TaskRow[]> {
  return db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND completedAt IS NULL
        AND dueDate IS NULL
        AND somedayAt IS NULL
      ORDER BY sortOrder`
  );
}

export function selectDay(db: SQLiteDatabase, day: number): Promise<DatedTask[]> {
  return db.getAllAsync<DatedTask>(
    `SELECT * FROM tasks
      WHERE deletedAt IS NULL
        AND dueDate >= $from
        AND dueDate < $to
      ORDER BY sortOrder`,
    { $from: startOfDay(day), $to: startOfDay(addDays(day, 1)) }
  );
}

export function selectProjects(db: SQLiteDatabase): Promise<ProjectRow[]> {
  return db.getAllAsync<ProjectRow>(
    'SELECT * FROM projects WHERE archivedAt IS NULL ORDER BY createdAt'
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

export function selectTask(db: SQLiteDatabase, id: string): Promise<TaskRow | null> {
  return db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = $id', { $id: id });
}

export function selectSubtasks(db: SQLiteDatabase, parentTaskId: string): Promise<SubtaskRow[]> {
  return db.getAllAsync<SubtaskRow>(
    'SELECT * FROM subtasks WHERE parentTaskId = $parentTaskId ORDER BY sortOrder',
    { $parentTaskId: parentTaskId }
  );
}

export async function selectPref(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM prefs WHERE key = $key',
    { $key: key }
  );
  return row ? row.value : null;
}

export async function setPref(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO prefs (key, value) VALUES ($key, $value)
      ON CONFLICT(key) DO UPDATE SET value = $value`,
    { $key: key, $value: value }
  );
}

export async function insertTask(db: SQLiteDatabase, task: NewTask, now: number): Promise<void> {
  const tail = await db.getFirstAsync<{ next: number }>(
    'SELECT COALESCE(MAX(sortOrder), 0) + 1 AS next FROM tasks'
  );
  await db.runAsync(
    `INSERT INTO tasks (id, title, tags, color, dueDate, createdAt, duration, priority, sortOrder)
      VALUES ($id, $title, $tags, $color, $dueDate, $createdAt, $duration, $priority, $sortOrder)`,
    {
      $id: newId(),
      $title: task.title,
      $tags: task.tags.length ? task.tags.join(',') : null,
      $color: DEFAULT_TASK_COLOR,
      $dueDate: task.dueDate,
      $createdAt: now,
      $duration: task.duration,
      $priority: task.priority,
      $sortOrder: tail ? tail.next : 1,
    }
  );
}

export async function insertProject(
  db: SQLiteDatabase,
  name: string,
  color: ColorToken,
  now: number
): Promise<void> {
  await db.runAsync(
    `INSERT INTO projects (id, name, color, createdAt)
      VALUES ($id, $name, $color, $createdAt)`,
    { $id: newId(), $name: name, $color: color, $createdAt: now }
  );
}

export async function updateProjectName(
  db: SQLiteDatabase,
  id: string,
  name: string
): Promise<void> {
  // dropping seedKey stops the seeded project resolving through i18n once the user has named it
  await db.runAsync('UPDATE projects SET name = $name, seedKey = NULL WHERE id = $id', {
    $name: name,
    $id: id,
  });
}

export async function archiveProject(
  db: SQLiteDatabase,
  id: string,
  now: number
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE tasks SET projectId = NULL WHERE projectId = $id', { $id: id });
    await db.runAsync('UPDATE projects SET archivedAt = $archivedAt WHERE id = $id', {
      $archivedAt: now,
      $id: id,
    });
  });
}

export async function assignDueDate(
  db: SQLiteDatabase,
  ids: string[],
  dueDate: number
): Promise<void> {
  if (!ids.length) return;
  const slots = ids.map((_, i) => `$id${i}`).join(', ');
  const params: Record<string, SQLiteBindValue> = { $dueDate: dueDate };
  ids.forEach((id, i) => {
    params[`$id${i}`] = id;
  });
  await db.runAsync(
    `UPDATE tasks SET dueDate = $dueDate WHERE id IN (${slots})`,
    params
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

export async function setTaskBlocked(
  db: SQLiteDatabase,
  id: string,
  blockedBy: string | null,
  nudgeAt: number | null,
  now: number
): Promise<void> {
  await db.runAsync(
    `UPDATE tasks SET blockedBy = $blockedBy, nudgeAt = $nudgeAt,
      blockedAt = CASE WHEN $blockedBy IS NULL THEN NULL ELSE COALESCE(blockedAt, $now) END
      WHERE id = $id`,
    { $blockedBy: blockedBy, $nudgeAt: nudgeAt, $now: now, $id: id }
  );
}

export async function setTaskSomeday(
  db: SQLiteDatabase,
  id: string,
  somedayAt: number | null,
  dueDate: number | null
): Promise<void> {
  await db.runAsync(
    'UPDATE tasks SET somedayAt = $somedayAt, dueDate = $dueDate WHERE id = $id',
    { $somedayAt: somedayAt, $dueDate: dueDate, $id: id }
  );
}

export async function setTaskSnoozedUntil(
  db: SQLiteDatabase,
  id: string,
  snoozedUntil: number | null
): Promise<void> {
  await db.runAsync('UPDATE tasks SET snoozedUntil = $snoozedUntil WHERE id = $id', {
    $snoozedUntil: snoozedUntil,
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

export type Decision = { task: TaskRow; outcome: Outcome; dueDate?: number };

export function selectClosedDay(db: SQLiteDatabase, day: number): Promise<ClosedDayRow | null> {
  return db.getFirstAsync<ClosedDayRow>('SELECT * FROM closed_days WHERE day = $day', {
    $day: startOfDay(day),
  });
}

export function selectClosedDays(db: SQLiteDatabase): Promise<ClosedDayRow[]> {
  return db.getAllAsync<ClosedDayRow>('SELECT * FROM closed_days ORDER BY day DESC');
}

export function selectClosedEntries(db: SQLiteDatabase, day: number): Promise<ClosedEntryRow[]> {
  return db.getAllAsync<ClosedEntryRow>(
    'SELECT * FROM closed_entries WHERE day = $day ORDER BY outcome, taskId',
    { $day: startOfDay(day) }
  );
}

export async function closeDay(
  db: SQLiteDatabase,
  day: number,
  settled: TaskRow[],
  decisions: Decision[],
  now: number
): Promise<void> {
  const stamp = startOfDay(day);
  const entries: { task: TaskRow; outcome: Outcome }[] = [
    ...settled.map((task) => ({ task, outcome: 'settled' as Outcome })),
    ...decisions.map((d) => ({ task: d.task, outcome: d.outcome })),
  ];

  const minutes = (rows: TaskRow[]) => rows.reduce((total, k) => total + (k.duration ?? 0), 0);
  const count = (outcome: Outcome) => decisions.filter((d) => d.outcome === outcome).length;

  await db.withTransactionAsync(async () => {
    for (const d of decisions) {
      if (d.outcome === 'carried') {
        // a blocked row is waiting on someone else, so carrying it must not count against the user
        await db.runAsync(
          `UPDATE tasks SET
            dueDate = $dueDate,
            carryCount = carryCount + (blockedBy IS NULL),
            nudgeAt = CASE WHEN blockedBy IS NULL THEN nudgeAt ELSE $dueDate END
            WHERE id = $id`,
          { $dueDate: d.dueDate ?? startOfDay(addDays(stamp, 1)), $id: d.task.id }
        );
      }
      if (d.outcome === 'rescheduled') {
        await db.runAsync('UPDATE tasks SET dueDate = $dueDate WHERE id = $id', {
          $dueDate: d.dueDate ?? startOfDay(addDays(stamp, 7)),
          $id: d.task.id,
        });
      }
      if (d.outcome === 'shelved') {
        await db.runAsync(
          'UPDATE tasks SET somedayAt = $now, dueDate = NULL WHERE id = $id',
          { $now: now, $id: d.task.id }
        );
      }
      if (d.outcome === 'struck') {
        await db.runAsync('UPDATE tasks SET deletedAt = $deletedAt WHERE id = $id', {
          $deletedAt: now,
          $id: d.task.id,
        });
      }
    }

    await db.runAsync(
      `INSERT INTO closed_days
        (day, closedAt, settled, carried, struck, rescheduled, shelved, committedMinutes, settledMinutes)
        VALUES ($day, $closedAt, $settled, $carried, $struck, $rescheduled, $shelved, $committed, $settledMinutes)
        ON CONFLICT(day) DO UPDATE SET
          closedAt = $closedAt, settled = $settled, carried = $carried, struck = $struck,
          rescheduled = $rescheduled, shelved = $shelved, committedMinutes = $committed,
          settledMinutes = $settledMinutes`,
      {
        $day: stamp,
        $closedAt: now,
        $settled: settled.length,
        $carried: count('carried'),
        $struck: count('struck'),
        $rescheduled: count('rescheduled'),
        $shelved: count('shelved'),
        $committed: minutes([...settled, ...decisions.map((d) => d.task)]),
        $settledMinutes: minutes(settled),
      }
    );

    await db.runAsync('DELETE FROM closed_entries WHERE day = $day', { $day: stamp });

    for (const entry of entries) {
      await db.runAsync(
        `INSERT INTO closed_entries (day, taskId, title, seedKey, outcome)
          VALUES ($day, $taskId, $title, $seedKey, $outcome)`,
        {
          $day: stamp,
          $taskId: entry.task.id,
          $title: entry.task.title,
          $seedKey: entry.task.seedKey,
          $outcome: entry.outcome,
        }
      );
    }
  });
}
