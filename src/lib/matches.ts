const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

export function matches(title: string, query: string) {
  return fold(title).includes(fold(query.trim()));
}

export function collectTags(tasks: { tags?: string[] }[]): string[] {
  const set = new Set<string>();
  for (const k of tasks) for (const tag of k.tags ?? []) set.add(tag);
  return [...set].sort();
}

export function hasTag(tags: string[] | undefined, sel: string | null): boolean {
  if (!sel) return true;
  return !!tags?.some((tag) => tag === sel || tag.startsWith(sel + '/'));
}
