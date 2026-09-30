const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

export function matches(title: string, query: string) {
  return fold(title).includes(fold(query.trim()));
}
