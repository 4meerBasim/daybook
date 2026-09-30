# Habit

Route: `Habit` (native stack, `presentation: 'fullScreenModal'`)
Summary: The habit's own sheet on darker paper — its name and streak tally, a 64pt count-up clock with a Start / Stop button, the number of sessions today, and a history of every session, newest first.

## Related
- Connects to: [[Today]] — tapping the habit row opens this screen, [[Main Tabs]] — the check button calls `navigation.goBack()`
- Features: [[Habit Session Timer]], [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/HabitScreen.tsx`. Rendered on `paper2` like [[Focus Mode]], which it is modelled on: the same 64pt monospace clock, and the same bottom pair of a wide primary button beside an outlined square check button. The difference is direction and memory — this clock counts up from zero and every stopped run is kept, where the focus clock counts down and keeps nothing.

The page scrolls as one `ScrollView` with the two buttons pinned over it in a `paper2` bar that runs to the bottom edge, so history rows do not show through; the content's bottom padding clears it. The header line carries the `HABITS` caption and the streak tally, which is still the literal 12, the same fixed number [[Today]] and [[Profile]] show. The habit name is `t.habit1` — there is one habit, and the route takes no params.

The history rows are drawn here at `metrics.row` with a `c.rule` bottom hairline, so they sit on the same 56pt rhythm as the rest of the app, but the page has no red margin rule. With no sessions the list shows a single "No sessions yet. Press start." row.

A run that is still going is recorded when the screen unmounts, so closing with the check button or the system back button both keep it — see [[Habit Session Timer]].
