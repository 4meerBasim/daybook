# Today

Route: `Main` → tab key `today` (default tab)
Summary: The day's ledger page — five dated tasks, a habits section with a streak tally, and a wax "page closed" stamp once everything is struck through.

## Related
- Connects to: [[Main Tabs]], [[Task Detail]] — long-press any task row, [[Calendar]] — swipe a row past the pick-date threshold, [[Page Closed]] — tap the wax stamp that appears when nothing is left, [[Quick Add Sheet]] — pen FAB, [[Settings]] — long-press the Today tab
- Features: [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Wax Page Closed Stamp]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Inbox Triage Chips]] — the destination half of the triage model lands here

## Notes
`src/screens/TodayScreen.tsx`. Tasks come from `tasks()` in `src/data/seed.ts`; completion is held in the `done` map in `src/state/store.tsx`. The header trailing label counts remaining tasks and swaps to "all done" at zero, which is also the condition that reveals the stamp.

Rows are wrapped in [[Swipe Row Actions]]. Snoozed and deleted tasks go into the `cleared` map in the same store and are filtered out of the list, so they also stop counting toward the remaining tally — clearing the page by swiping raises the stamp just as striking every row does.
