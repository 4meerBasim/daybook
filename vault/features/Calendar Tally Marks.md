# Calendar Tally Marks

Status: shipped
Summary: Each day in the month grid carries hand-tally strokes under its number, so a glance shows how loaded the month is.

## Details
`src/components/TallyMarks.tsx` is deliberately minimal — `n = Math.min(count, max)` vertical 1.5×8pt bars with a 2pt gap, and nothing at all when the count is zero, so light days stay blank rather than showing a "0".

`src/screens/CalendarScreen.tsx` now feeds it from live data: `useTasks()` is bucketed by `dueAt` into a per-day count for the displayed month (capped at `max={5}`), replacing the old hardcoded `load` map in `src/data/seed.ts`. Today's marks are drawn in vermilion and every other day in `ink2`, matching the vermilion underline on the current date. Each cell reserves a fixed 8pt bottom-aligned slot so the day numbers stay on a common baseline regardless of tally count.

Tapping a cell writes to `sel` on the shared store and the day list below re-renders with that day's real due tasks; because `sel` is global rather than screen state, the selected day is remembered across visits (clamped to the month length).

The grid flips with `row(rtl)` and its leading blank offset is computed from the real first-weekday (`(firstDate.getDay() + 6) % 7`) — a single value that mirrors correctly under `row(rtl)` for both scripts (the previous locale-dependent `ar ? 3 : 1` hack is gone). The marks themselves need no mirroring — they are plain verticals. Only the habit streak on [[Today]] draws the diagonal that binds a bundle of five, and that one does flip; see [[In-App RTL and Arabic Typography]]. Device-event dots are a separate, distinct corner marker — see [[Device calendar overlay]].

The design's prose describes "max 5, then a struck bundle", but its own render simply caps the count at five and draws no bundle, which is what is built here.

## Related
- Page: [[Calendar]]
- Features: [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Calendar drag-to-schedule]], [[Device calendar overlay]]
- Bugs: none
