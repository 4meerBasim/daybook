# Inbox

Route: `Main` → tab key `inbox`
Summary: Undated captures waiting to be triaged, grouped into one row per project plus a "No project" row for the unassigned ones, ending with a "New project" row that opens the add sheet.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap a project row, [[Inbox Empty]] — long-press the Inbox tab, [[Quick Add Sheet]] — pen FAB, or the "New project" row, which opens it in project mode
- Features: [[Project Grouped Tasks]], [[Add Habits and Projects]], [[Inline Page Search]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[Natural Language Quick Add]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: [[Inbox Triage Chips]]

## Notes
`src/screens/InboxScreen.tsx`. The page renders `ProjectRows` for the `inbox` list — see [[Project Grouped Tasks]]. Every project is listed, including ones with nothing in the inbox (shown as 0/0), and the last row is "New project", which opens [[Quick Add Sheet]] in project mode through the `onAddProject` prop — see [[Add Habits and Projects]]. That row is hidden while searching. The header count is now derived: the number of `inbox` tasks from `useTasks()`, unaffected by the search query. The `Someday · 4` section label is still a literal and is hidden while searching.

The static Today / Someday chips that used to sit on each capture row went with the rows themselves; [[Inbox Triage Chips]] is still planned and has nowhere drawn at the moment. This is the landing spot for anything [[Natural Language Quick Add]] parses without a date.
