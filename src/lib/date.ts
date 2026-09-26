export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function atTime(ts: number, hour: number, minute: number): number {
  const d = new Date(ts);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function startOfMonth(ts: number): number {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfNextMonth(ts: number): number {
  const d = new Date(startOfMonth(ts));
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

export function dayOfMonth(ts: number): number {
  return new Date(ts).getDate();
}

export function nextWeekday(ts: number, weekday: number): number {
  const start = startOfDay(ts);
  const ahead = (weekday - new Date(start).getDay() + 7) % 7 || 7;
  return startOfDay(addDays(start, ahead));
}

export function timeLabel(ts: number | null): string {
  if (ts === null) return '';
  const d = new Date(ts);
  if (!d.getHours() && !d.getMinutes()) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function isOverdue(ts: number, now: number): boolean {
  return ts < startOfDay(now);
}

export function isYesterday(ts: number, now: number): boolean {
  return startOfDay(ts) === startOfDay(addDays(now, -1));
}
