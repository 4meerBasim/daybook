export const SHARED_PAGE_VERSION = 1;

export type SharedPage = { v: number; t: string; l: string[] };

export function encodePage(title: string, lines: string[]): string {
  const payload: SharedPage = { v: SHARED_PAGE_VERSION, t: title, l: lines };
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodePage(raw: string): { title: string; lines: string[] } | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SharedPage>;
    if (parsed.v !== SHARED_PAGE_VERSION) return null;
    if (typeof parsed.t !== 'string' || !Array.isArray(parsed.l)) return null;
    const lines = parsed.l.filter((line): line is string => typeof line === 'string');
    return { title: parsed.t, lines };
  } catch {
    return null;
  }
}

export function pageLink(title: string, lines: string[]): string {
  return `daybook://page?d=${encodePage(title, lines)}`;
}
