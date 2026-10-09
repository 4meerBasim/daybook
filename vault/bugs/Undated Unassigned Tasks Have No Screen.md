# Undated Unassigned Tasks Have No Screen

Status: not-fixed
Found: `src/db/queries.ts` — no query covers `dueDate IS NULL AND projectId IS NULL`
Summary: Deleting the Inbox left undated, unfiled tasks with nowhere to appear — quick add still creates them, and no screen in the app lists them.

## Details
`selectInbox` was the only query matching `dueDate IS NULL AND projectId IS NULL`. It went with [[Glass Tab Bar]]'s redesign, along with `InboxScreen.tsx`, the `inbox` tab key and the `inbox` slice in `src/state/store.tsx`. Nothing took over the filter. Every remaining query excludes those rows:

| Query | Why it misses them |
|---|---|
| `selectToday` | `dueDate IS NOT NULL AND dueDate < $dayEnd` |
| `selectUpcoming` | `dueDate >= $dayEnd` |
| `selectMonth` | `dueDate >= $from AND dueDate < $to` |
| `selectAssigned` | `projectId IS NOT NULL` |

They are still being created. `insertTask` writes no `projectId` at all, so it is always NULL, and `onAdd` in `src/screens/QuickAddSheet.tsx` passes `dueDate` straight from `draft()`, which returns null whenever `parsed.hasDate` is false. So any capture typed without a day — the exact case [[Natural Language Quick Add]] is built to tolerate — inserts a row that no snapshot ever reads back.

`archiveProject` makes a second source of them: it sets `projectId = NULL` on every task of the project it archives, inside the same transaction that stamps `archivedAt`. A dated task lands back on [[Today]] or [[Upcoming]]; an undated one goes nowhere. That is the path [[Projects As A Real Entity]] documents as "the tasks come back as unfiled captures", and it no longer has a list to come back to.

The copy was updated but the data was not. The dashed destination chip on [[Quick Add Sheet]] now reads "No date" / "بلا تاريخ" instead of "Saved to Inbox", and `deleteProjectHint` was reworded to "Its tasks are unassigned, not deleted." Both are literally true and neither is a lie about a screen that no longer exists — but they also no longer tell the user that what they just typed is unreachable. A chip that says "No date" reads as a property of the task, not as a warning.

Nothing is lost on disk. The rows are in `tasks` with `deletedAt` NULL and come back the moment a query asks for them, which is what makes this a wiring gap rather than data loss.

Options, none taken yet:

- Widen `selectToday` to include undated rows, so a dateless capture lands on today's page. Cheapest, and it matches the "one page at a time" framing — but it puts work the user did not schedule onto a day they did not pick.
- Give [[Profile]] or a new pane an "unfiled" section over a restored `selectInbox`. Closest to the old behaviour without the tab.
- Make the sheet refuse to insert without a date. Smallest change, worst product — it defeats the point of quick capture.

Whichever is chosen, the chip copy has to change with it, and [[Inbox Triage Chips]] — which is still written against the Inbox page — needs rebasing onto wherever these rows end up.

## Related
- Feature: [[Natural Language Quick Add]], [[Offline First Local Store]], [[Projects As A Real Entity]], [[Glass Tab Bar]]
- Page: [[Quick Add Sheet]], [[Main Tabs]], [[Today]], [[Projects]], [[Project Picker]], [[Profile]]
- Bugs: [[Quick Add Does Not Create Tasks]]
- Enhancements: [[Inbox Triage Chips]], [[Ink Decay and Task Retirement]], [[System Capture Entry Points]], [[Voice Brain Dump Capture]], [[Waiting On Follow-Ups]]
