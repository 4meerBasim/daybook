# Habit

Route: `Habit` with `{ habitId }` (native stack, `presentation: 'fullScreenModal'`)
Summary: One habit's own sheet on darker paper — its name and, for the seeded habit, its streak tally, a 64pt count-up clock with a Start / Stop button, the number of that habit's sessions today, and a history of each of them, newest first.

## Related
- Connects to: [[Today]] — tapping a habit row opens this screen for that habit, [[Main Tabs]] — the check button calls `navigation.goBack()`
- Features: [[Habit Session Timer]], [[Add Habits and Projects]], [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/HabitScreen.tsx`. Rendered on `paper2` like [[Focus Mode]], which it is modelled on: the same 64pt monospace clock, and the same bottom pair of a wide primary button beside an outlined square check button. The difference is direction and memory — this clock counts up from zero and every stopped run is kept, where the focus clock counts down and keeps nothing.

The page scrolls as one `ScrollView` with the two buttons pinned over it in a `paper2` bar that runs to the bottom edge, so history rows do not show through; the content's bottom padding clears it. The route takes a `habitId` param, which `Root` passes to the screen as a prop. The habit is looked up in `useHabits()` by that id, its name is the page title, and the session count and history are `habitSessions` filtered to that id, so each habit has its own page. The header line carries the `HABITS` caption and the streak tally, drawn only when the habit's `streak` is above zero: the seeded habit shows its fixed 12, the same number [[Today]] and [[Profile]] show, and a habit added through [[Add Habits and Projects]] starts at 0 and shows none.

The history rows are drawn here at `metrics.row` with a `c.rule` bottom hairline, so they sit on the same 56pt rhythm as the rest of the app, but the page has no red margin rule. With no sessions the list shows a single "No sessions yet. Press start." row.

A run that is still going is recorded when the screen unmounts, so closing with the check button or the system back button both keep it — see [[Habit Session Timer]].
