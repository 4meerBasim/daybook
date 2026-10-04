import { SmartList, SmartListRule, Task } from '../data/seed';
import { Strings } from '../i18n/strings';
import { hasTag } from './matches';
import { startOfToday } from './day';

const DAY = 24 * 60 * 60 * 1000;

export function matchTask(task: Task, rule: SmartListRule, now?: number): boolean {
  const ref = now ?? Date.now();

  if (rule.tags && rule.tags.length > 0) {
    if (!rule.tags.some((tag) => hasTag(task.tags, tag))) return false;
  }

  if (rule.due) {
    const due = task.dueAt;
    const start = startOfToday();
    switch (rule.due) {
      case 'today':
        if (due == null || due < start || due >= start + DAY) return false;
        break;
      case 'week':
        if (due == null || due < start || due >= start + 7 * DAY) return false;
        break;
      case 'overdue':
        if (due == null || due >= ref) return false;
        break;
      case 'none':
        if (due != null) return false;
        break;
    }
  }

  if (rule.priority && rule.priority.length > 0) {
    if (!task.priority || task.priority === 'none' || !rule.priority.includes(task.priority)) {
      return false;
    }
  }

  if (rule.projectId !== undefined) {
    if (task.projectId !== rule.projectId) return false;
  }

  if (rule.color && rule.color.length > 0) {
    if (!task.color || !rule.color.includes(task.color)) return false;
  }

  if (rule.someday) {
    if (task.someday !== true) return false;
  }

  return true;
}

export function filterTasks(tasks: Task[], rule: SmartListRule, now?: number): Task[] {
  return tasks.filter((task) => matchTask(task, rule, now));
}

export function builtinSmartLists(t: Strings): SmartList[] {
  return [
    { id: 'builtin-overdue', name: t.overdue, rules: { due: 'overdue' }, position: 0, builtin: true },
    { id: 'builtin-week', name: t.dueThisWeek, rules: { due: 'week' }, position: 1, builtin: true },
    { id: 'builtin-someday', name: t.someday, rules: { someday: true }, position: 2, builtin: true },
  ];
}
