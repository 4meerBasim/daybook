import type { TaskRow } from '../db/schema';

export const DECAY_DAYS = 14;

export const RETIRE_AT_CARRIES = 3;

const DAY = 86_400_000;

export function inkDecay(task: TaskRow, now: number, enabled: boolean): number {
  if (!enabled || task.completedAt !== null) return 0;
  const age = (now - task.createdAt) / DAY;
  return Math.min(Math.max(age / DECAY_DAYS, 0), 1);
}

export function asksRetirement(task: TaskRow): boolean {
  if (task.completedAt !== null || task.carryCount < RETIRE_AT_CARRIES) return false;
  return task.retireAskedCarry === null || task.retireAskedCarry < task.carryCount;
}
