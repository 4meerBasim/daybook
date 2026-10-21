import type { SQLiteDatabase } from 'expo-sqlite';
import { EN, type StringKey } from '../i18n/strings';
import { addDays, atTime, startOfDay } from '../lib/date';
import { PRIORITY_HIGH, type ColorToken } from './schema';

export const SEED_PROJECT_ID = 'seed-studio';
export const SEED_INVOICE_TASK_ID = 'seed-invoice';

type SeedTask = {
  id: string;
  seedKey: StringKey;
  color: ColorToken;
  dueDate?: number;
  projectId?: string;
  completedAt?: number;
  priority?: number;
  reminderAt?: number;
  tags?: string[];
};

type SeedSubtask = {
  id: string;
  seedKey: StringKey;
  completedAt?: number;
};

function seedTasks(now: number): SeedTask[] {
  const today = startOfDay(now);

  return [
    {
      id: SEED_INVOICE_TASK_ID,
      seedKey: 'task1',
      color: 'blue',
      dueDate: atTime(today, 10, 0),
      projectId: SEED_PROJECT_ID,
      priority: PRIORITY_HIGH,
      reminderAt: atTime(today, 9, 30),
      tags: ['invoice'],
    },
    { id: 'seed-budget', seedKey: 'task2', color: 'och', dueDate: atTime(today, 14, 0) },
    { id: 'seed-oat-milk', seedKey: 'task3', color: 'moss', dueDate: today },
    { id: 'seed-plumber', seedKey: 'task4', color: 'ver', dueDate: addDays(today, -1) },
    { id: 'seed-flights', seedKey: 'task5', color: 'blue', dueDate: today },
    {
      id: 'seed-dentist',
      seedKey: 'dentist',
      color: 'moss',
      dueDate: atTime(addDays(today, 1), 15, 0),
    },
    {
      id: 'seed-weekly-review',
      seedKey: 'weeklyReview',
      color: 'och',
      dueDate: atTime(addDays(today, 1), 17, 0),
    },
    { id: 'seed-car-insurance', seedKey: 'carInsurance', color: 'ver', dueDate: addDays(today, 5) },
    {
      id: 'seed-launch-site',
      seedKey: 'launchSite',
      color: 'blue',
      dueDate: addDays(today, 8),
      projectId: SEED_PROJECT_ID,
      tags: ['design'],
    },
    { id: 'seed-amman-hotel', seedKey: 'ammanHotel', color: 'blue', dueDate: addDays(today, 9) },
    { id: 'seed-idea-board', seedKey: 'ideaBoard', color: 'blue' },
    { id: 'seed-ask-sami', seedKey: 'askSami', color: 'blue' },
    { id: 'seed-kitchen-lamp', seedKey: 'kitchenLamp', color: 'blue' },
    {
      id: 'seed-project-brief',
      seedKey: 'projectBrief',
      color: 'blue',
      dueDate: addDays(today, -5),
      projectId: SEED_PROJECT_ID,
      completedAt: addDays(today, -5),
      tags: ['design'],
    },
    {
      id: 'seed-moodboards',
      seedKey: 'moodboards',
      color: 'blue',
      dueDate: addDays(today, -4),
      projectId: SEED_PROJECT_ID,
      completedAt: addDays(today, -4),
      tags: ['design'],
    },
  ];
}

function seedSubtasks(now: number): SeedSubtask[] {
  return [
    { id: 'seed-invoice-sub-1', seedKey: 'sub1', completedAt: startOfDay(now) },
    { id: 'seed-invoice-sub-2', seedKey: 'sub2' },
    { id: 'seed-invoice-sub-3', seedKey: 'sub3' },
  ];
}

export async function seedFirstRun(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM tasks');
  if (existing && existing.n > 0) return;

  const now = Date.now();
  const tasks = seedTasks(now);
  const subtasks = seedSubtasks(now);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO projects (id, name, seedKey, color, createdAt)
        VALUES ($id, $name, $seedKey, $color, $createdAt)`,
      {
        $id: SEED_PROJECT_ID,
        $name: EN.studio,
        $seedKey: 'studio',
        $color: 'blue',
        $createdAt: now,
      }
    );

    for (const [index, task] of tasks.entries()) {
      await db.runAsync(
        `INSERT INTO tasks
          (id, title, seedKey, projectId, color, dueDate, createdAt, completedAt, priority, sortOrder, reminderAt, tags)
          VALUES ($id, $title, $seedKey, $projectId, $color, $dueDate, $createdAt, $completedAt, $priority, $sortOrder, $reminderAt, $tags)`,
        {
          $id: task.id,
          $title: EN[task.seedKey],
          $seedKey: task.seedKey,
          $projectId: task.projectId ?? null,
          $color: task.color,
          $dueDate: task.dueDate ?? null,
          $createdAt: now,
          $completedAt: task.completedAt ?? null,
          $priority: task.priority ?? null,
          $sortOrder: index + 1,
          $reminderAt: task.reminderAt ?? null,
          $tags: task.tags ? task.tags.join(',') : null,
        }
      );
    }

    for (const [index, subtask] of subtasks.entries()) {
      await db.runAsync(
        `INSERT INTO subtasks (id, parentTaskId, title, seedKey, completedAt, sortOrder)
          VALUES ($id, $parentTaskId, $title, $seedKey, $completedAt, $sortOrder)`,
        {
          $id: subtask.id,
          $parentTaskId: SEED_INVOICE_TASK_ID,
          $title: EN[subtask.seedKey],
          $seedKey: subtask.seedKey,
          $completedAt: subtask.completedAt ?? null,
          $sortOrder: index + 1,
        }
      );
    }
  });
}
