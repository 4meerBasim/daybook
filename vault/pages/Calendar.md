# Calendar

Route: `Calendar` (native stack)
Summary: A month grid where each day carries tally marks for its workload, with the selected day's tasks listed underneath.

## Related
- Connects to: [[Upcoming]] — reached by long-pressing the Upcoming tab; returns via the system back gesture, [[Today]] — reached by swiping a row past the pick-date threshold, [[Main Tabs]]
- Features: [[Offline First Local Store]], [[Calendar Tally Marks]], [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Snooze And Delete Share One Cleared Map]], [[Page Header Shows A Frozen Date]]
- Enhancements: [[Day Capacity Budget]], [[Weekly Spread Review]]

## Notes
`src/screens/CalendarScreen.tsx`, reading the `month` snapshot from [[Offline First Local Store]] — every non-deleted task due inside the current calendar month. Tallies are counted per day-of-month from those rows and the list under the grid is the rows matching `sel`, both with derived counts. Nothing here is hardcoded any more: the vermilion underline and the dimming of past days follow the real current date, and `sel` initialises to it.

Because tallies are real workload, they only mark the days the seeded and user-created tasks actually fall on, which is sparser than the mock's twelve marked days. That is the trade for the marks meaning something.

This is also where the snooze/delete distinction is visible: a snoozed task is hidden on [[Today]] but still listed here under its day, while a deleted one is gone from both — see [[Snooze And Delete Share One Cleared Map]].

Day selection lives in `sel` on the shared store, so the chosen day survives leaving and re-entering the screen. The leading blank-cell offset changes with locale (`ar ? 3 : 1`) to match the week-start difference, and the grid itself flips direction with `row(rtl)`.

Two pieces of the frame are still the mock's: the grid is a fixed thirty cells, and the month and year labels are the literal strings `t.month` and `2026`. Real month names in both locales now exist — `months` in `src/i18n/strings.ts`, added for [[Page Header Shows A Frozen Date]] — so the labels are no longer what blocks this. The grid is: a real month title over a grid that is always thirty days would be a worse contradiction than a literal one, so both change together when the calendar is built out.

The list under the grid is `LedgerRow`s now rather than the screen's own copy of the row markup, so a long task name wraps and the rules below it stay on the period — see [[Ledger Paper Chrome]]. The day header above it and the trailing blank rules use the same unit.
