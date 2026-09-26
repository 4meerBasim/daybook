# Project Picker

Route: no stack route — a `Modal` sheet rendered by whichever list opened it
Summary: The sheet that files a task into a project: the task's title, one row per project, and a `No project` row that clears the assignment.

## Related
- Connects to: [[Inbox]] — long-press a capture, [[Project Detail]] — long-press a project task, [[Main Tabs]], [[Swipe States]] — the other page that claims long-press
- Features: [[Projects As A Real Entity]], [[Offline First Local Store]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]]
- Bugs: none found
- Enhancements: [[Inbox Triage Chips]]

## Notes
`src/screens/ProjectPickerSheet.tsx`. The mock draws no picker at all — the Inbox caption only says "long-press for a project" — so the sheet is designed from the chrome the mock does specify: ink scrim at 28%, card background, 20pt top corners, a 36x4 grabber, and ruled rows inside.

Rows read as a radio group: the project's colour dot, its name, and a tick on whichever one the task currently belongs to. `No project` is the last row and carries the tick for an unfiled capture, so clearing an assignment is the same gesture as making one. Picking writes through the store's existing `edit(id, { projectId })` — no new action was needed, since `TaskPatch` already carried the column.

It is mounted conditionally by its caller, so each open starts fresh. It is a plain `Modal` for the same reason [[Projects]]' sheets are.

The mock's Swipe States screen illustrates long-press as lift-to-reorder while the Inbox caption assigns long-press to the project picker. Reorder is not implemented anywhere, so long-press belongs to this sheet and [[Swipe States]] keeps its reorder row as the static illustration it always was.
