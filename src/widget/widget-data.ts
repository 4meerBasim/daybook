import { openDatabaseAsync } from 'expo-sqlite';

export type WidgetTask = { id: string; title: string; done: boolean };
export type WidgetLabels = { title: string; empty: string; progress: (done: number, total: number) => string };
export type WidgetState = { tasks: WidgetTask[]; lang: 'en' | 'ar' };

const DB_NAME = 'daybook.db';
const MAX_TASKS = 7;

type TaskRow = { id: string; title: string; done: number };
type LangRow = { value: string };

export async function loadWidgetState(): Promise<WidgetState> {
  try {
    const db = await openDatabaseAsync(DB_NAME);
    const [rows, langRow] = await Promise.all([
      db.getAllAsync<TaskRow>(
        `SELECT t.id AS id, t.title AS title, COALESCE(s.done, 0) AS done
         FROM tasks t
         LEFT JOIN task_state s ON s.taskId = t.id AND s.deletedAt IS NULL
         WHERE t.list = 'today'
           AND (t.later IS NULL OR t.later = 0)
           AND t.deletedAt IS NULL
           AND (s.cleared IS NULL OR s.cleared = 0)
         ORDER BY t.rowid
         LIMIT ?`,
        [MAX_TASKS]
      ),
      db.getFirstAsync<LangRow>(`SELECT value FROM settings WHERE key = 'lang'`),
    ]);
    const lang = langRow?.value === 'ar' ? 'ar' : 'en';
    return { tasks: rows.map((r) => ({ id: r.id, title: r.title, done: !!r.done })), lang };
  } catch {
    return { tasks: [], lang: 'en' };
  }
}

export function widgetLabels(lang: 'en' | 'ar'): WidgetLabels {
  if (lang === 'ar') {
    return {
      title: 'اليوم',
      empty: 'لا مهام لليوم. افتح دفترك.',
      progress: (done, total) => `${done} من ${total}`,
    };
  }
  return {
    title: 'Today',
    empty: 'Nothing for today. Open your daybook.',
    progress: (done, total) => `${done} of ${total}`,
  };
}
