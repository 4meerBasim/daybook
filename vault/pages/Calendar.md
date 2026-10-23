# Calendar

Route: `Calendar` (native stack)
Summary: A month grid where each day carries tally marks for its workload, with the selected day's tasks listed underneath.

## Related
- Connects to: [[Upcoming]] — reached by long-pressing the Upcoming tab; returns via the system back gesture, [[Today]] — reached by swiping a row past the pick-date threshold, [[Main Tabs]], [[Unfiled]] — will route here via its pick-date swipe once Calendar can apply a date to a task
- Features: [[Offline First Local Store]], [[Calendar Tally Marks]], [[Glass Tab Bar]] — not rendered here, which is the bug above, [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Lift The Ink]], [[Day Capacity Budget]], [[Waiting On Follow-Ups]]
- Bugs: [[Snooze And Delete Share One Cleared Map]], [[Page Header Shows A Frozen Date]], [[Stack Screens Reserve Tab Bar Space]], [[Calendar Overflow Is Unreachable]], [[Native Layout Direction Is Not Pinned]], [[Swipe Actions Not Wired Into Task Lists]], [[Stack Screens Ignore The Bottom Safe Area]]
- Enhancements: [[Weekly Spread Review]]

## Notes
`src/screens/CalendarScreen.tsx`, reading the `month` snapshot from [[Offline First Local Store]] — every non-deleted task due inside the current calendar month. Tallies are counted per day-of-month from those rows and the list under the grid is the rows matching `sel`, both with derived counts. Nothing here is hardcoded any more: the vermilion underline and the dimming of past days follow the real current date, and `sel` initialises to it.

Because tallies are real workload, they only mark the days the seeded and user-created tasks actually fall on, which is sparser than the mock's twelve marked days. That is the trade for the marks meaning something.

This is also where the snooze/delete distinction is visible: a snoozed task is hidden on [[Today]] but still listed here under its day, while a deleted one is gone from both — see [[Snooze And Delete Share One Cleared Map]].

Day selection lives in `sel` on the shared store, so the chosen day survives leaving and re-entering the screen. The leading blank count is derived from the real first-of-month weekday with the project's `(getDay() - t.firstWeekday + 7) % 7` convention — `firstWeekday` is Monday (1) in English and Saturday (6) in Arabic — and the grid flips direction with `row(rtl)`, so the blanks land on the reading-start edge in both scripts.

The whole frame is real now, all of it off `Date.now()`: the grid spans the true number of days in the current month (28–31) over four, four, five or six rows, the month name comes from `t.months[getMonth()]` and the year from `getFullYear()`. The old `month` literal in `src/i18n/strings.ts` is deleted. There is no prev/next month — `sel` is a bare day number that cannot say which month it belongs to, so navigation needs a store change and is out of scope; the screen renders the current month only.

The selected-day list sits in a scroll view below the fixed grid, so its rows stay reachable however many tasks a day holds — see [[Calendar Overflow Is Unreachable]]. Those rows are `TaskRow`s now, so a tap completes the task through the shared store's `complete` exactly as on [[Today]] — the title strikes through and a long name wraps on the period — see [[Ledger Paper Chrome]]. Only complete is wired; snooze, pick-date and delete are deliberately left off here — see [[Swipe Actions Not Wired Into Task Lists]]. The day header above the list and the trailing blank rules use the same unit.
