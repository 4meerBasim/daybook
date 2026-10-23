const SPLITTERS = /\n+|(?<=[.!?؟।])\s+|\s+(?:and then|then also|also,|،\s*ثم|\sثم\s)\s*/gi;

export function splitDump(text: string): string[] {
  return text
    .split(SPLITTERS)
    .map((item) => (item ?? '').replace(/^\s*[-*•]\s*/, '').replace(/[.!?؟]\s*$/, '').trim())
    .filter((item) => item.length > 1);
}
