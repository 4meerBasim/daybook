# Ledger Paper Chrome

Status: shipped
Summary: Every list in the app is drawn as a page of ruled ledger paper — a red vertical margin rule, 56pt horizontal rules, and blank rules filling the space below the content.

## Details
`src/components/Ledger.tsx` holds the whole vocabulary:

- `Ledger` — the sheet. A top hairline plus an absolutely positioned 1pt vermilion line at `metrics.marginLine` (52pt) from the start edge, at 0.6 opacity.
- `LedgerRow` — a 56pt row (`metrics.row`) with a bottom hairline, start padding 16 and end padding at the 20pt gutter.
- `SectionLabel` — a full-height row carrying a tracked 11pt monospace caption, so headings occupy a ruled line instead of breaking the rhythm.
- `EmptyRules` — n empty ruled rows, used to run the lines past the end of the content so the page never just stops.
- `Checkbox` / `Dot` — the 22pt square box (or moss circle for habits) and the coloured project dot.

Metrics come from `src/theme/tokens.ts` and are shared with every screen, which is why the rules line up across [[Today]], [[Upcoming]], [[Inbox]], [[Project Detail]], [[Search]], [[Task Detail]], [[Page Closed]] and [[Swipe States]] even where those screens lay out rows themselves. [[Inbox Empty]], [[Calendar]] and [[Search]] redraw the margin rule inline using the same `insetStart(rtl, metrics.marginLine)` so it mirrors correctly in Arabic.

## Related
- Page: [[Today]], [[Upcoming]], [[Inbox]], [[Inbox Empty]], [[Search]], [[Project Detail]], [[Task Detail]], [[Calendar]], [[Page Closed]], [[Swipe States]]
- Features: [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Ink Strike-Through Completion]], [[Collapsing Page Header]]
- Bugs: none
