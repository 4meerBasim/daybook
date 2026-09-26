# Calendar Tally Marks

Status: shipped
Summary: Each day in the month grid carries hand-tally strokes under its number, so a glance shows how loaded the month is.

## Details
`src/components/TallyMarks.tsx` is deliberately minimal — `n = Math.min(count, max)` vertical 1.5×8pt bars with a 2pt gap, and nothing at all when the count is zero, so light days stay blank rather than showing a "0".

`src/screens/CalendarScreen.tsx` feeds it from real workload now: the `month` snapshot out of [[Offline First Local Store]] is counted per day-of-month into a map (capped at `max={5}`), where it used to read a hardcoded `load` table. Today's marks are drawn in vermilion and every other day in `ink2`, matching the vermilion underline on the current date — which is also derived rather than pinned to day 18. Each cell reserves a fixed 8pt bottom-aligned slot so the day numbers stay on a common baseline regardless of tally count.

The marks are sparser than the mock's twelve loaded days, because they now reflect the tasks that exist rather than an illustration of a busy month. A snoozed task still marks its day; a soft-deleted one does not.

Tapping a cell writes to `sel` on the shared store and the day list below filters the same month rows; because `sel` is global rather than screen state, the selected day is remembered across visits, and it starts on the real current day.

The grid itself flips with `row(rtl)` and its leading blank offset changes with locale (`ar ? 3 : 1`) so the month starts on the right weekday in both scripts. The marks themselves need no mirroring — they are plain verticals. Only the habit streak on [[Today]] draws the diagonal that binds a bundle of five, and that one does flip; see [[In-App RTL and Arabic Typography]].

The design's prose describes "max 5, then a struck bundle", but its own render simply caps the count at five and draws no bundle, which is what is built here.

## Related
- Page: [[Calendar]]
- Features: [[Offline First Local Store]], [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Snooze And Delete Share One Cleared Map]]
- Enhancements: [[Day Capacity Budget]], [[Weekly Spread Review]]
