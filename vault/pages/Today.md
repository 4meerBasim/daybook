# Today

Route: `Main` → tab key `today` (default tab)
Summary: The day's ledger page — one row per project with tasks on the `today` list, a habits section whose row opens the habit's timer page, and a wax "page closed" stamp once everything is struck through.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap a project row, [[Page Closed]] — tap the wax stamp that appears when nothing is left, [[Habit]] — tap the habit row, [[Quick Add Sheet]] — pen FAB, [[Settings]] — long-press the Today tab
- Features: [[Project Grouped Tasks]], [[Inline Page Search]], [[Wax Page Closed Stamp]], [[Habit Session Timer]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[Natural Language Quick Add]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: [[Inbox Triage Chips]] — the destination half of the triage model lands here

## Notes
`src/screens/TodayScreen.tsx`. The page no longer lists tasks. It renders `ProjectRows` for the `today` list — see [[Project Grouped Tasks]] — and the tasks themselves, with their swipe and strike-through, live one level down on [[Project Detail]]. There is no separate upcoming list any more: every dated task is on the `today` list, including the five seed tasks dated tomorrow or later in the week, which keep their day in `meta`, carry `later: true`, and appear inside their project here.

The header trailing label still counts remaining tasks: it filters `useTasks()` to the `today` list, leaves out tasks flagged `later`, and counts those not in the `done` map in `src/state/store.tsx`, swapping to "all done" at zero, which is also the condition that reveals the stamp. The later-dated tasks therefore count toward neither, although they are included in the done/total count on their project row. Tasks snoozed or deleted on [[Project Detail]] or the Recent tab go into `cleared` and drop out of `useTasks()`, so they stop counting toward the tally — clearing the day by swiping raises the stamp just as striking every task does.

The habits section is a single row: a moss circle, the habit name, and the streak tally. The row is a `Pressable` that opens [[Habit]], and the circle fills moss once `habitSessions` in the store holds at least one session — see [[Habit Session Timer]]. The streak beside it is still the literal 12. The section is hidden while the search field has text, and returns when it is cleared.
