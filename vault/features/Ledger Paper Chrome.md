# Ledger Paper Chrome

Status: shipped
Summary: Every list in the app is drawn as a page of ruled ledger paper — a red vertical margin rule, horizontal rules on a fixed period, and blank rules filling the space below the content — and a row that outgrows one rule takes two rather than clipping its text.

## Details
`src/components/Ledger.tsx` holds the whole vocabulary:

- `Ledger` — the sheet. A top hairline plus an absolutely positioned 1pt vermilion line at `metrics.marginLine` (52pt) from the start edge, at 0.6 opacity.
- `useRuling` — the hook that gives a row its height, described below.
- `rowContent` — the inner flex row every ruled row shares: `metrics.gap` between children, `metrics.rowPad` above and below, start padding 16 and end padding at the 20pt gutter.
- `LedgerRow` — a growing row built from those two.
- `SectionLabel` — a full-height row carrying a tracked 11pt monospace caption, so headings occupy a ruled line instead of breaking the rhythm.
- `EmptyRules` — n empty ruled rows, used to run the lines past the end of the content so the page never just stops.
- `Checkbox` / `Dot` — the 22pt square box (or moss circle for habits) and the coloured project dot.

### The ruling unit

The period of the ruling is one number, not a constant repeated per screen. `rulingUnit(fontScale)` in `src/theme/tokens.ts` maps the system font scale onto the design's three steps — 56 at normal size, 64 and 72 at the two largest — and `ThemeProvider` exposes the result as `unit`. Rows, section headings and the empty-rule continuation all read `unit`, so the lines stay phase-aligned at every text size. `metrics.ruling` is only the base value that function starts from; nothing else reads it as a row height.

A row is always a whole multiple of the unit. `useRuling` measures the row's content through `onLayout` and sets the row to `ceil(contentHeight / unit)` units, so a title that wraps takes two rules instead of pushing everything below it off the grid. It also returns `grown`, which a row uses to know it is taller than one rule.

That measurement is why every ruled row is built the same way: an outer box with the snapped height and `justifyContent: 'center'`, and an inner `rowContent` view that reports its natural height. `TaskRow`, `ProjectScreen`'s rows, the subtask rows on [[Task Detail]], the demo rows on [[Swipe States]] and the three rules on [[Onboarding]] each do this directly because they are pressables or carry their own background; everything else uses `LedgerRow`.

`SwipeableRow` draws its rule as a 1pt absolutely positioned line rather than a border, because its height comes from the face it wraps: a border would sit outside that height and put its rows a pixel out of step with every other row on the page.

### The content column

Row internals are `padding: 0 20 0 16`, a 22pt checkbox, a 12pt gap and a 16pt title inset, which puts the content column at `metrics.content` — 66. The design names 66 for its sub-heading rows, and the gap is 12 rather than 14 so the two agree.

Metrics come from `src/theme/tokens.ts` and are shared with every screen, which is why the rules line up across [[Today]], [[Upcoming]], [[Project Detail]], [[Search Results]], [[Task Detail]], [[Page Closed]] and [[Swipe States]] even where those screens lay out rows themselves. [[Calendar]] and [[Search Results]] redraw the margin rule inline using the same `insetStart(rtl, metrics.marginLine)` so it mirrors correctly in Arabic.

### What still holds one line

Growth is for text the user wrote. Task titles, project names, subtasks and note excerpts wrap; tab labels, times, counts, fractions and section sub-headings keep `numberOfLines={1}`, because they are table chrome and a wrapped count reads as a mistake. Chips keep the design's 26 / 28 / 30 heights as a `minHeight` with an explicit `lineHeight`, so a long label truncates inside the pill instead of stretching the row.

## Related
- Page: [[Today]], [[Upcoming]], [[Profile]], [[Search Results]], [[Project Detail]], [[Task Detail]], [[Calendar]], [[Page Closed]], [[Swipe States]], [[Settings]], [[Onboarding]], [[Quick Add Sheet]], [[Unfiled]]
- Features: [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Ink Strike-Through Completion]], [[Collapsing Page Header]], [[Glass Tab Bar]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]], [[Quick Add Highlight Drifts From The Caret]] — the same growing-text rule applied to the capture field, [[Stack Screens Ignore The Bottom Safe Area]], [[Calendar Overflow Is Unreachable]]
- Enhancements: [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ink Decay and Task Retirement]], [[Notes With Live Task Lines]], [[Deal Me One Task Picker]], [[Weekly Spread Review]], [[Focus Live Activity and Widgets]]
