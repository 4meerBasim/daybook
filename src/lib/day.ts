import { Strings } from '../i18n/strings';

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthDayKey(d: Date): string {
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toArabicDigits(value: string | number, ar: boolean): string {
  const s = String(value);
  if (!ar) return s;
  return s.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function formatDay(d: Date, t: Strings, ar: boolean): string {
  const weekday = t.weekdaysLong[weekdayIndex(d)];
  const month = t.months[d.getMonth()];
  return `${weekday}، ${toArabicDigits(d.getDate(), ar)} ${month}`.replace(/،/, ar ? '،' : ',');
}

export function formatShortDay(d: Date, t: Strings, ar: boolean): string {
  return `${toArabicDigits(d.getDate(), ar)} ${t.months[d.getMonth()]}`;
}

export function formatTime(ts: number, ar: boolean): string {
  const d = new Date(ts);
  return `${toArabicDigits(pad(d.getHours()), ar)}:${toArabicDigits(pad(d.getMinutes()), ar)}`;
}

export function relativeYears(n: number, ar: boolean): string {
  const num = toArabicDigits(n, ar);
  if (ar) return `قبل ${num} ${n === 1 ? 'سنة' : n === 2 ? 'سنتين' : 'سنوات'}`;
  return `${n} ${n === 1 ? 'year' : 'years'} ago`;
}

function dayAt(dayOffset: number, hour: number, minute: number): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dayOffset, hour, minute, 0, 0).getTime();
}

export function startOfToday(): number {
  return dayAt(0, 0, 0);
}

export function todayAt(hour: number, minute: number): number {
  return dayAt(0, hour, minute);
}

export function thisEvening(): number {
  return dayAt(0, 18, 0);
}

export function tomorrowMorning(): number {
  return dayAt(1, 9, 0);
}

export function nextWeek(): number {
  return dayAt(7, 9, 0);
}

export function inDays(n: number): number {
  return dayAt(Math.max(0, Math.floor(n)), 9, 0);
}

export function inWeeks(n: number): number {
  return dayAt(Math.max(0, Math.floor(n)) * 7, 9, 0);
}

export function nextWeekdayAt(jsWeekday: number, hour: number, minute: number): number {
  const current = new Date().getDay();
  let offset = (jsWeekday - current + 7) % 7;
  if (offset === 0) offset = 7;
  return dayAt(offset, hour, minute);
}

export function timeToday(hour: number, minute: number): number {
  const today = todayAt(hour, minute);
  return today > Date.now() ? today : dayAt(1, hour, minute);
}

export function isOverdue(dueAt: number | null | undefined, done: boolean): boolean {
  return dueAt != null && dueAt < Date.now() && !done;
}

export function computeStreak(dayKeys: Iterable<string>, today: Date = new Date()): number {
  const set = dayKeys instanceof Set ? dayKeys : new Set(dayKeys);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
