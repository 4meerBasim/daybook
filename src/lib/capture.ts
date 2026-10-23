const URL_RE = /\bhttps?:\/\/\S+/i;

export type Captured = { title: string; link: string | null };

export function fromShared(text: string): Captured {
  const trimmed = text.trim();
  if (!trimmed) return { title: '', link: null };

  const found = URL_RE.exec(trimmed);
  if (!found) return { title: trimmed, link: null };

  // a bare link is a terrible task title, so it becomes the body and the rest is the title
  const link = found[0];
  const rest = trimmed.replace(link, '').replace(/\s+/g, ' ').trim();
  return { title: rest, link };
}
