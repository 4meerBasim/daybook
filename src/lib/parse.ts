import { Palette } from '../theme/palette';

export type TokenKind = 'plain' | 'date' | 'time' | 'tag' | 'pri' | 'rep';

export type Token = { text: string; kind: TokenKind };
export type Chip = { label: string; kind: Exclude<TokenKind, 'plain'> };

export type Parsed = { tokens: Token[]; chips: Chip[]; hasDate: boolean; hasLaterDay: boolean };

const RE =
  /(\btomorrow\b|\btoday\b|\btonight\b|\bnext (?:week|monday|friday)\b|\bevery (?:day|week|monday|friday|month)\b|غداً|غدا|اليوم|كل (?:يوم|أسبوع|شهر)|\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|#[\w؀-ۿ]+|!+|مهم)/gi;

export function parse(q: string, ar: boolean): Parsed {
  const tokens: Token[] = [];
  const chips: Chip[] = [];
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
    } else if (/^!|مهم/.test(w)) {
      kind = 'pri';
      chips.push({ label: ar ? 'أولوية عالية' : 'High priority', kind: 'pri' });
    } else if (/^every|^كل/.test(lw)) {
      kind = 'rep';
      chips.push({
        label: '↻ ' + (ar ? 'يتكرر' : 'Repeats ' + lw.replace('every ', '')),
        kind: 'rep',
      });
    } else if (/\d/.test(w)) {
      kind = 'time';
      chips.push({ label: w.toUpperCase().replace(/\s+/, ' '), kind: 'time' });
    } else {
      kind = 'date';
      if (!/^(today|tonight|اليوم)$/.test(lw)) hasLaterDay = true;
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

  return { tokens, chips, hasDate, hasLaterDay };
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
