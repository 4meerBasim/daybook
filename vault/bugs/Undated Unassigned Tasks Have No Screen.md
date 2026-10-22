# Undated Unassigned Tasks Have No Screen

Status: fixed
Found: `src/db/queries.ts` — no query covered `dueDate IS NULL AND projectId IS NULL`
Summary: Deleting the Inbox left undated, unfiled captures with nowhere to appear; they now have a dedicated [[Unfiled]] stack screen reached from the preferences rows.

## Details
Fixed by adding an [[Unfiled]] surface rather than widening [[Today]] or refusing dateless captures. The 3-tab bar is a fixed design decision — see [[Glass Tab Bar]] — so no tab and no `inbox` slice came back; `InboxScreen.tsx` stayed deleted. Instead the list hangs off the Projects/preferences rows, the one place [[Profile]] and [[Settings]] both reach.

What was built:

- `selectUnfiled(db)` in `src/db/queries.ts`, matching `deletedAt IS NULL AND dueDate IS NULL AND projectId IS NULL`, ordered by `sortOrder`. It keeps completed rows and mirrors `selectAssigned`'s shape, so a task ticked on the screen can be un-ticked. No new index — the partial `tasks_dueDate` index already covers `deletedAt IS NULL AND dueDate IS NULL`, and the table is personal-scale.
- An `unfiled: TaskRow[]` slice on the store snapshot in `src/state/store.tsx`, loaded in the same `Promise.all` as the other lists.
- `src/screens/UnfiledScreen.tsx` — the captures as ledger rows, each a `SwipeableRow` wrapping a `TaskRow` with three actions: complete, a tomorrow swipe that files the task by due date so it moves onto the Upcoming list, and delete, plus long-press to open [[Task Detail]]. Pick-date is deliberately left out until the calendar can apply a date. See [[Swipe Row Actions]]. It pads to `metrics.gutter`, not the tab bar, so it does not repeat [[Stack Screens Reserve Tab Bar Space]].
- An Unfiled row in `src/components/SettingsRows.tsx` directly under Projects, showing the live count, reached from both [[Profile]] and [[Settings]] via a new `onOpenUnfiled`. The `Unfiled` stack screen is registered in `src/navigation/Root.tsx`.
- New strings `unfiled`, `unfiledEmpty`, `unfiledEmptyHint` in `src/i18n/strings.ts`, English and Arabic.

Both sources this bug named now land somewhere. A dateless capture from [[Quick Add Sheet]] — `insertTask` still writes `projectId` NULL and the sheet still writes `dueDate` NULL when no day is parsed — is read straight back by `selectUnfiled`. So is a task that `archiveProject` unassigns when its project is archived, the path [[Projects As A Real Entity]] documents.

The chip copy on [[Quick Add Sheet]] ("No date" / "بلا تاريخ") was not changed here; it is now true without stranding anything, because the row it describes is reachable again. [[Inbox Triage Chips]] can now be rebased onto this surface.

## Related
- Page: [[Unfiled]], [[Quick Add Sheet]], [[Main Tabs]], [[Today]], [[Projects]], [[Project Picker]], [[Profile]], [[Settings]], [[Upcoming]]
- Feature: [[Natural Language Quick Add]], [[Offline First Local Store]], [[Projects As A Real Entity]], [[Glass Tab Bar]], [[Swipe Row Actions]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Stack Screens Reserve Tab Bar Space]]
- Enhancements: [[Inbox Triage Chips]], [[Ink Decay and Task Retirement]], [[System Capture Entry Points]], [[Voice Brain Dump Capture]], [[Waiting On Follow-Ups]]
