import type { Palette } from '../theme/palette';
import type { Strings } from '../i18n/strings';
import { addDays, atTime, minutesLabel, nextWeekday, startOfDay } from './date';

export type TokenKind = 'plain' | 'date' | 'time' | 'tag' | 'pri' | 'rep' | 'dur';

export type Token = { text: string; kind: TokenKind };
export type Chip = { label: string; kind: Exclude<TokenKind, 'plain'> };

export type Parsed = { tokens: Token[]; chips: Chip[]; hasDate: boolean };

const RE =
  /(\btomorrow\b|\btoday\b|\btonight\b|\bnext (?:week|monday|friday)\b|\bevery (?:day|week|monday|friday|month)\b|غداً|غدا|اليوم|كل (?:يوم|أسبوع|شهر)|\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|[\d٠-٩]{1,3}\s*(?:h(?:rs?|ours?)?|m(?:ins?|inutes?)?)\b|[\d٠-٩]{1,3}\s*(?:دقائق|دقيقة|ساعات|ساعة|د|س)|#[\w؀-ۿ]+|!+|مهم)/gi;

const DURATION_RE = /^([\d٠-٩]{1,3})\s*(.*)$/;

const HOUR_UNITS = /^(?:h|hr|hrs|hour|hours|س|ساعة|ساعات)$/i;

const ARABIC_ZERO = '٠'.charCodeAt(0);

function latinDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - ARABIC_ZERO));
}

export function durationMinutes(text: string): number | null {
  const m = DURATION_RE.exec(text.trim());
  if (!m) return null;
  const n = Number(latinDigits(m[1]));
  if (!n) return null;
  return HOUR_UNITS.test(m[2].trim()) ? n * 60 : n;
}


const TAG_RE = /#[\w؀-ۿ]+/g;

export function splitTags(title: string): { title: string; tags: string[] } {
  const found = title.match(TAG_RE) ?? [];
  return {
    title: title.replace(TAG_RE, '').replace(/\s+/g, ' ').trim(),
    tags: [...new Set(found.map((tag) => tag.slice(1).toLowerCase()))],
  };
}

export function parse(q: string, ar: boolean, t: Strings): Parsed {
  const tokens: Token[] = [];
  const chips: Chip[] = [];
  const re = new RegExp(RE.source, 'gi');
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(q))) {
    if (m.index > last) tokens.push({ text: q.slice(last, m.index), kind: 'plain' });
    const w = m[0];
    const lw = w.toLowerCase();
    let kind: TokenKind;

    if (/^#/.test(w)) {
      kind = 'tag';
      chips.push({ label: w, kind: 'tag' });
    } else if (/^!|مهم/.test(w)) {
      kind = 'pri';
      chips.push({ label: ar ? 'أولوية عالية' : 'High priority', kind: 'pri' });
    } else if (/^every|^كل/.test(lw)) {
      kind = 'rep';
      chips.push({
        label: '↻ ' + (ar ? 'يتكرر' : 'Repeats ' + lw.replace('every ', '')),
        kind: 'rep',
      });
    } else if (/^\d+\s*(?:am|pm)|^\d+:\d/i.test(w)) {
      kind = 'time';
      chips.push({ label: w.toUpperCase().replace(/\s+/, ' '), kind: 'time' });
    } else if (/^[\d٠-٩]/.test(w)) {
      const minutes = durationMinutes(w);
      kind = 'dur';
      chips.push({ label: minutes ? minutesLabel(minutes, t) : w, kind: 'dur' });
    } else {
      kind = 'date';
      const L: Record<string, string> = {
        tomorrow: ar ? 'غداً' : 'Tomorrow',
        today: ar ? 'اليوم' : 'Today',
        tonight: ar ? 'الليلة' : 'Tonight',
      };
      chips.push({
        label: L[lw] || (ar ? 'غداً' : lw.replace(/^./, (c) => c.toUpperCase())),
        kind: 'date',
      });
    }

    tokens.push({ text: w, kind });
    last = m.index + w.length;
  }

  if (last < q.length) tokens.push({ text: q.slice(last), kind: 'plain' });
  if (!tokens.length) tokens.push({ text: '', kind: 'plain' });

  const hasDate = chips.some(
    (c) => (c.kind === 'date' || c.kind === 'time') && !/\d/.test(c.label)
  );

  return { tokens, chips, hasDate };
}

export type Draft = {
  title: string;
  tags: string[];
  dueDate: number | null;
  duration: number | null;
  high: boolean;
};

const MONDAY = 1;
const FRIDAY = 5;

function resolveDay(text: string, now: number): number {
  const w = text.toLowerCase();
  if (w.includes('monday')) return nextWeekday(now, MONDAY);
  if (w.includes('friday')) return nextWeekday(now, FRIDAY);
  if (w.includes('next week')) return startOfDay(addDays(now, 7));
  if (w.includes('tomorrow') || w.includes('غد')) return startOfDay(addDays(now, 1));
  return startOfDay(now);
}

function applyTime(day: number, text: string): number {
  const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(text);
  if (!m) return day;
  const hour = (Number(m[1]) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0);
  return atTime(day, hour, m[2] ? Number(m[2]) : 0);
}

export function draft(p: Parsed, now: number): Draft {
  const written = p.tokens
    .filter(
      (tk) =>
        tk.kind === 'plain' ||
        tk.kind === 'tag' ||
        tk.kind === 'rep' ||
        (tk.kind === 'time' && !p.hasDate)
    )
    .map((tk) => tk.text)
    .join('');

  const { title, tags } = splitTags(written);
  const high = p.tokens.some((tk) => tk.kind === 'pri');
  const durToken = p.tokens.find((tk) => tk.kind === 'dur');
  const duration = durToken ? durationMinutes(durToken.text) : null;

  if (!p.hasDate) return { title, tags, dueDate: null, duration, high };

  const dateToken = p.tokens.find((tk) => tk.kind === 'date');
  const timeToken = p.tokens.find((tk) => tk.kind === 'time');
  const day = dateToken ? resolveDay(dateToken.text, now) : startOfDay(now);

  return {
    title,
    tags,
    dueDate: timeToken ? applyTime(day, timeToken.text) : day,
    duration,
    high,
  };
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
    case 'dur':
      return c.moss;
    default:
      return c.ink;
  }
}

const TAG_TINTS: { bg: keyof Palette; fg: keyof Palette }[] = [
  { bg: 'mossS', fg: 'moss' },
  { bg: 'ochS', fg: 'och' },
  { bg: 'blueS', fg: 'blue' },
  { bg: 'verS', fg: 'ver' },
];

export function tagColors(tag: string, c: Palette): { bg: string; fg: string } {
  let sum = 0;
  for (let i = 0; i < tag.length; i += 1) sum += tag.charCodeAt(i);
  const tint = TAG_TINTS[sum % TAG_TINTS.length];
  return { bg: c[tint.bg], fg: c[tint.fg] };
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
    case 'dur':
      return { bg: c.mossS, fg: c.moss };
  }
}
