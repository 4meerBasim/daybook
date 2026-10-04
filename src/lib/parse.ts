import { AR, EN } from '../i18n/strings';
import { Palette } from '../theme/palette';
import {
  inDays,
  inWeeks,
  nextWeek,
  nextWeekdayAt,
  thisEvening,
  timeToday,
  todayAt,
  tomorrowMorning,
} from './day';
import { describeRecurrence, parseRepeatToken, RecurrenceRule } from './recurrence';

export type TokenKind = 'plain' | 'date' | 'time' | 'tag' | 'pri' | 'rep';

export type Token = { text: string; kind: TokenKind };
export type Chip = {
  label: string;
  kind: Exclude<TokenKind, 'plain'>;
  value?: number;
  rule?: RecurrenceRule;
};

export type Parsed = {
  tokens: Token[];
  chips: Chip[];
  hasDate: boolean;
  hasLaterDay: boolean;
  dueAt?: number | null;
  recurrence?: RecurrenceRule | null;
};

const RE =
  /(\bin \d{1,2}\s+(?:days?|weeks?)\b|بعد\s+[\d٠-٩]{1,2}\s+(?:يوم|أيام|أسبوع|أسابيع)|\bat \d{1,2}(?::\d{2})?(?![:\d])(?!\s*(?:am|pm))\b|\btomorrow\b|\btoday\b|\btonight\b|\bnext (?:week|monday|friday)\b|\bevery (?:day|week|monday|friday|month)\b|\b(?:noon|midnight|morning|afternoon|evening)\b|\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|غداً|غدا|اليوم|منتصف الليل|ظهراً|ظهرا|صباحاً|صباحا|عصراً|عصرا|مساءً|مساء|الأحد|الاثنين|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|كل (?:يوم|أسبوع|شهر)|\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|#[\w؀-ۿ]+(?:\/[\w؀-ۿ]+)*|!+|مهم|\burgent\b|\bimportant\b|عاجل)/gi;

const WEEKDAY_JS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  الأحد: 0,
  الاثنين: 1,
  الإثنين: 1,
  الثلاثاء: 2,
  الأربعاء: 3,
  الخميس: 4,
  الجمعة: 5,
  السبت: 6,
};

const TIMEWORD: Record<string, [number, number]> = {
  noon: [12, 0],
  midnight: [0, 0],
  morning: [9, 0],
  afternoon: [15, 0],
  evening: [18, 0],
  ظهراً: [12, 0],
  ظهرا: [12, 0],
  'منتصف الليل': [0, 0],
  صباحاً: [9, 0],
  صباحا: [9, 0],
  عصراً: [15, 0],
  عصرا: [15, 0],
  مساءً: [18, 0],
  مساء: [18, 0],
};

function toLatinNum(s: string): number {
  return Number(s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))));
}

export function parse(q: string, ar: boolean): Parsed {
  const tokens: Token[] = [];
  const chips: Chip[] = [];
  const t = ar ? AR : EN;
  const re = new RegExp(RE.source, 'gi');
  let last = 0;
  let hasLaterDay = false;
  let m: RegExpExecArray | null;

  while ((m = re.exec(q))) {
    if (m.index > last) tokens.push({ text: q.slice(last, m.index), kind: 'plain' });
    const w = m[0];
    const lw = w.toLowerCase();
    let kind: TokenKind;

    if (/^#/.test(w)) {
      kind = 'tag';
      chips.push({ label: w, kind: 'tag' });
    } else if (/^!+$/.test(w) || /^(?:urgent|important)$/i.test(w) || w === 'مهم' || w === 'عاجل') {
      kind = 'pri';
      const medium = w === '!!';
      chips.push({
        label: medium
          ? ar
            ? 'أولوية متوسطة'
            : 'Medium priority'
          : ar
            ? 'أولوية عالية'
            : 'High priority',
        kind: 'pri',
        value: medium ? 2 : 3,
      });
    } else if (/^every /i.test(w) || /^كل /.test(w)) {
      kind = 'rep';
      const rule = parseRepeatToken(w, ar) ?? undefined;
      chips.push({
        label: rule ? describeRecurrence(rule, t, ar) : t.repeat,
        kind: 'rep',
        rule,
      });
    } else if (/\d/.test(w) && /(?:am|pm)$/i.test(w)) {
      kind = 'time';
      chips.push({ label: w.toUpperCase().replace(/\s+/, ' '), kind: 'time' });
    } else {
      kind = 'date';
      let value: number | undefined;
      let later = false;

      const relEn = /^in (\d{1,2})\s+(days?|weeks?)$/i.exec(w);
      const relAr = /^بعد\s+([\d٠-٩]{1,2})\s+(يوم|أيام|أسبوع|أسابيع)$/.exec(w);
      const atTime = /^at (\d{1,2})(?::(\d{2}))?$/i.exec(w);
      const nextDay = /^next (monday|friday)$/i.exec(lw);

      if (relEn) {
        const n = Number(relEn[1]);
        value = /week/i.test(relEn[2]) ? inWeeks(n) : inDays(n);
        later = true;
      } else if (relAr) {
        const n = toLatinNum(relAr[1]);
        value = /أسبوع|أسابيع/.test(relAr[2]) ? inWeeks(n) : inDays(n);
        later = true;
      } else if (atTime) {
        value = timeToday(Math.min(23, Number(atTime[1])), atTime[2] ? Math.min(59, Number(atTime[2])) : 0);
      } else if (TIMEWORD[lw] ?? TIMEWORD[w]) {
        const [h, min] = TIMEWORD[lw] ?? TIMEWORD[w];
        value = timeToday(h, min);
      } else if (WEEKDAY_JS[lw] !== undefined || WEEKDAY_JS[w] !== undefined) {
        value = nextWeekdayAt(WEEKDAY_JS[lw] ?? WEEKDAY_JS[w], 9, 0);
        later = true;
      } else if (nextDay) {
        value = nextWeekdayAt(WEEKDAY_JS[nextDay[1].toLowerCase()], 9, 0);
        later = true;
      } else if (/^tonight$/i.test(w)) {
        value = thisEvening();
      } else if (/^(tomorrow|غدا|غداً)$/i.test(w)) {
        value = tomorrowMorning();
        later = true;
      } else if (/^(today|اليوم)$/i.test(w)) {
        value = todayAt(9, 0);
      } else if (/^next week$/i.test(w)) {
        value = nextWeek();
        later = true;
      }

      if (later) hasLaterDay = true;
      const L: Record<string, string> = {
        tomorrow: ar ? 'غداً' : 'Tomorrow',
        today: ar ? 'اليوم' : 'Today',
        tonight: ar ? 'الليلة' : 'Tonight',
      };
      chips.push({
        label: L[lw] || (ar ? w : lw.replace(/^./, (c) => c.toUpperCase())),
        kind: 'date',
        value,
      });
    }

    tokens.push({ text: w, kind });
    last = m.index + w.length;
  }

  if (last < q.length) tokens.push({ text: q.slice(last), kind: 'plain' });
  if (!tokens.length) tokens.push({ text: '', kind: 'plain' });

  const hasDate =
    chips.some((c) => c.kind === 'date' && c.value != null) ||
    chips.some((c) => (c.kind === 'date' || c.kind === 'time') && !/\d/.test(c.label));

  const dueAt = chips.find((c) => c.kind === 'date' && c.value != null)?.value ?? null;
  const recurrence = chips.find((c) => c.kind === 'rep' && c.rule != null)?.rule ?? null;

  return { tokens, chips, hasDate, hasLaterDay, dueAt, recurrence };
}

export function tokenColor(kind: TokenKind, c: Palette): string {
  switch (kind) {
    case 'date':
    case 'time':
      return c.blue;
    case 'tag':
      return c.och;
    case 'pri':
      return c.ver;
    case 'rep':
      return c.moss;
    default:
      return c.ink;
  }
}

export function chipColors(kind: Chip['kind'], c: Palette): { bg: string; fg: string } {
  switch (kind) {
    case 'date':
    case 'time':
      return { bg: c.blueS, fg: c.blue };
    case 'tag':
      return { bg: c.ochS, fg: c.och };
    case 'pri':
      return { bg: c.verS, fg: c.ver };
    case 'rep':
      return { bg: c.mossS, fg: c.moss };
  }
}
