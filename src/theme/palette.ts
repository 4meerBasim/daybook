export type Palette = {
  paper: string;
  paper2: string;
  card: string;
  rule: string;
  ink: string;
  ink2: string;
  ink3: string;
  ver: string;
  verS: string;
  och: string;
  ochS: string;
  moss: string;
  mossS: string;
  blue: string;
  blueS: string;
};

export const LIGHT: Palette = {
  paper: '#F5F0E6',
  paper2: '#EDE6D8',
  card: '#FBF8F1',
  rule: '#D9D0BF',
  ink: '#1C2333',
  ink2: '#4A5262',
  ink3: '#6F7580',
  ver: '#C7402A',
  verS: '#F4DCD5',
  och: '#8F6A1A',
  ochS: '#F3E6C8',
  moss: '#4F7A5B',
  mossS: '#DCE8DC',
  blue: '#2B4C8C',
  blueS: '#DBE3F2',
};

export const DARK: Palette = {
  paper: '#14171D',
  paper2: '#0F1115',
  card: '#1C2028',
  rule: '#2A303B',
  ink: '#EDE8DC',
  ink2: '#AEB4C0',
  ink3: '#8B92A0',
  ver: '#E2634C',
  verS: '#3A2420',
  och: '#D4A64A',
  ochS: '#33291A',
  moss: '#7FB08A',
  mossS: '#1F2E23',
  blue: '#7C9FE0',
  blueS: '#1E2738',
};

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixInk(from: string, to: string, p: number): string {
  if (p <= 0) return from;
  if (p >= 1) return to;
  const a = channels(from);
  const b = channels(to);
  const channel = (i: number) => Math.round(a[i] + (b[i] - a[i]) * p);
  return `#${((channel(0) << 16) | (channel(1) << 8) | channel(2)).toString(16).padStart(6, '0')}`;
}
