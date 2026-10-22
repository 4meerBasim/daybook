# Unfiled

Route: `Unfiled` (native stack)
Summary: The ruled list that undated, unassigned captures land on — tasks with no due date and no project — reached from the Unfiled row in the preferences list.

## Related
- Connects to: [[Profile]], [[Settings]] — reached from the Unfiled row on either; returns via the back chevron, [[Task Detail]] — long-press a row, [[Main Tabs]]. Not yet connected: [[Calendar]] — the pick-date swipe is deliberately left out until Calendar can apply a date to a task.
- Features: [[Swipe Row Actions]], [[Natural Language Quick Add]], [[Offline First Local Store]], [[Projects As A Real Entity]] — archiving a project is one source of these rows, [[Ledger Paper Chrome]], [[Ink Strike-Through Completion]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]] — the gap this screen closes, [[Stack Screens Reserve Tab Bar Space]] — the mistake it avoids by padding to the gutter rather than the tab bar, [[Stack Screens Ignore The Bottom Safe Area]], [[Ink Stroke Spans The Whole Title Column]], [[Native Layout Direction Is Not Pinned]]
- Enhancements: [[Inbox Triage Chips]], [[System Capture Entry Points]], [[Voice Brain Dump Capture]], [[Ink Decay and Task Retirement]], [[Waiting On Follow-Ups]]

## Notes
`src/screens/UnfiledScreen.tsx`. The list is one query, `selectUnfiled` in `src/db/queries.ts` — every row with `deletedAt`, `dueDate` and `projectId` all NULL, ordered by `sortOrder` to match every other task query. Completed captures stay in the slice, so a row ticked here can be un-ticked rather than disappearing into a state no query reads back. It feeds a new `unfiled` slice on the store snapshot, filled in the same `Promise.all` as [[Today]] and [[Upcoming]]. No new index: the partial `tasks_dueDate` index already narrows `deletedAt IS NULL AND dueDate IS NULL`, and the table is personal-scale.

This is not a resurrected Inbox. The 3-tab bar is fixed — see [[Glass Tab Bar]] — so the surface is a stack screen hung off the preferences rows in `src/components/SettingsRows.tsx`, the row list [[Profile]] and [[Settings]] both render. The Unfiled row sits directly under Projects and shows its live count in the value column, the same shape as the Projects row.

Each row is a `SwipeableRow` wrapping a `TaskRow` with three live actions: complete — a real toggle, since completed rows stay in the slice — a tomorrow swipe that files the task by setting its due date to the next day, so it leaves Unfiled for [[Upcoming]], and delete; a long-press opens [[Task Detail]]. The same three accessibility actions ride each row for the rotor. Pick-date is deliberately left out until [[Calendar]] can apply a date to a task. See [[Swipe Row Actions]].

It is a stack screen that never shows the tab bar, so it pads its scroll content to `metrics.gutter`, not `useTabBarFootprint()` — deliberately sidestepping [[Stack Screens Reserve Tab Bar Space]]. The header is a back chevron over a 40pt serif title, the [[Project Detail]] pattern, with [[Task Detail]]'s `t.back` affordance. Empty, it says so in the app's voice — one plain line and an italic serif note that captures with no date or project collect here — over the same ruled empty lines every other list draws.
