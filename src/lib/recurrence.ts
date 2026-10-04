import { Strings } from '../i18n/strings';
import { toArabicDigits } from './day';

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'everyN';

export type RecurrenceRule = {
  freq: RecurrenceFreq;
  interval?: number;
  weekdays?: number[];
  afterCompletion?: boolean;
};

const WEEKDAY_NAMES: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function normalizeInterval(interval: number | undefined): number {
  const n = interval ?? 1;
  return n < 1 ? 1 : Math.floor(n);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function nextOccurrence(rule: RecurrenceRule, fromEpoch: number): number {
  const interval = normalizeInterval(rule.interval);
  const from = new Date(fromEpoch);
  const h = from.getHours();
  const min = from.getMinutes();
  const s = from.getSeconds();
  const ms = from.getMilliseconds();
  const at = (y: number, mo: number, d: number) => new Date(y, mo, d, h, min, s, ms).getTime();

  switch (rule.freq) {
    case 'daily':
    case 'everyN':
      return at(from.getFullYear(), from.getMonth(), from.getDate() + interval);

    case 'weekly': {
      const weekdays = Array.from(
        new Set((rule.weekdays ?? []).filter((d) => d >= 0 && d <= 6))
      ).sort((a, b) => a - b);
      if (weekdays.length === 0) {
        return at(from.getFullYear(), from.getMonth(), from.getDate() + interval * 7);
      }
      const dow = from.getDay();
      const laterThisWeek = weekdays.find((d) => d > dow);
      if (laterThisWeek !== undefined) {
        return at(from.getFullYear(), from.getMonth(), from.getDate() + (laterThisWeek - dow));
      }
      const daysToNextWeekStart = 7 - dow;
      const offset = daysToNextWeekStart + (interval - 1) * 7 + weekdays[0];
      return at(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    }

    case 'monthly': {
      const monthIndex = from.getMonth() + interval;
      const year = from.getFullYear() + Math.floor(monthIndex / 12);
      const month = ((monthIndex % 12) + 12) % 12;
      const day = Math.min(from.getDate(), daysInMonth(year, month));
      return at(year, month, day);
    }
  }
}

export function describeRecurrence(rule: RecurrenceRule, t: Strings, ar: boolean): string {
  switch (rule.freq) {
    case 'daily':
      return t.repeatsDaily;
    case 'everyN':
      return t.repeatsEveryDays.replace('{n}', toArabicDigits(rule.interval ?? 1, ar));
    case 'weekly': {
      if (rule.weekdays?.length) {
        const days = [...rule.weekdays]
          .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
          .map((d) => t.weekdaysLong[(d + 6) % 7])
          .join(ar ? '، ' : ', ');
        return t.repeatsOn.replace('{days}', days);
      }
      return t.repeatsWeekly;
    }
    case 'monthly':
      return t.repeatsMonthly;
  }
}

export function parseRepeatToken(token: string, ar: boolean): RecurrenceRule | null {
  const t = token.trim().toLowerCase();
  switch (t) {
    case 'every day':
    case 'كل يوم':
      return { freq: 'daily' };
    case 'every week':
    case 'كل أسبوع':
      return { freq: 'weekly' };
    case 'every month':
    case 'كل شهر':
      return { freq: 'monthly' };
  }
  const m = /^every\s+(\w+)$/.exec(t);
  if (m) {
    const weekday = WEEKDAY_NAMES[m[1]];
    if (weekday !== undefined) return { freq: 'weekly', weekdays: [weekday] };
  }
  void ar;
  return null;
}
