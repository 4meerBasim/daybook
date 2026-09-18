# Calendar Tally Marks

Status: shipped
Summary: Each day in the month grid carries hand-tally strokes under its number, so a glance shows how loaded the month is.

## Details
`src/components/TallyMarks.tsx` is deliberately minimal — `n = Math.min(count, max)` vertical 1.5×8pt bars with a 2pt gap, and nothing at all when the count is zero, so light days stay blank rather than showing a "0".

`src/screens/CalendarScreen.tsx` feeds it from the `load` map in `src/data/seed.ts` (day number → task count, capped at `max={5}`). Today's marks are drawn in vermilion and every other day in `ink2`, matching the vermilion underline on the current date. Each cell reserves a fixed 8pt bottom-aligned slot so the day numbers stay on a common baseline regardless of tally count.

Tapping a cell writes to `sel` on the shared store and the day list below re-renders from `dayPool()`; because `sel` is global rather than screen state, the selected day is remembered across visits.

The grid itself flips with `row(rtl)` and its leading blank offset changes with locale (`ar ? 3 : 1`) so the month starts on the right weekday in both scripts.

## Related
- Page: [[Calendar]]
- Features: [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: none
