# Notes With Live Task Lines

Status: shipped
Summary: A checkbox line written inside a note is a real task — it appears on Today, and completing either side shows on both because there is only one record of it.

## Details
This collapses the note-app / task-app split. A note is where thinking happens; the commitments inside it should not have to be re-entered anywhere.

**Notes became first-class.** Schema v8 adds `notes` (id, title, timestamps, soft delete) and `note_lines` (id, noteId, sortOrder, text, nullable `taskId`). The `notes` column on `tasks` is untouched — that is still a body hanging off a task, which is a different thing from a note with its own identity.

**The identity problem, which the note called the hard part.** The requirement was that a task line survive the user rewriting the text around it. The answer is that the note body is not a string: **each line is its own row with its own id**, and the editor is one `TextInput` per line rather than one textarea over the whole body. Rewriting line 4 updates row `l4`'s text; inserting a line above it shifts `sortOrder` and touches nothing else. There is no line-index fragility because there are no line indexes — only ids.

This is also why the editing model is a real one rather than markdown round-tripping: Return commits the current line and inserts a new row after it, an emptied non-task line deletes itself on blur, and the `+ Add a line` row appends.

**Two-way sync is not sync.** The line stores no checked flag. A line's completion *is* the task's `completedAt`, read through `useNote`, so there is nothing to keep in step:

- Tick the checkbox in the note → `complete(taskId)` → the row on [[Today]] strikes through.
- Tick it on [[Today]] → the line in the note renders checked and struck.

The only field that genuinely exists twice is the text, and that has one direction: editing a line writes the task's `title` in the same transaction (and clears `seedKey`, so a seeded title stops resolving through i18n once the user has rewritten it). Renaming from elsewhere is not possible, because no other screen edits a task's title.

**Promotion.** Typing `[ ]`, `- [ ]` or `[x]` at the start of a line promotes it: the marker is stripped, a task is created dated today, and `taskId` is linked — the live-parse equivalent of what [[Natural Language Quick Add]] does for dates, applied to a line. Long-pressing the checkbox demotes the line back to plain text.

**Deleting a line — the product call the note left open.** Deleting a line, or demoting it, **unlinks the task and leaves it alive**. Deleting a line of a note should never silently destroy a commitment the user made; the task stays on [[Today]] where they can see and strike it deliberately. Deleting a whole note unlinks all of its tasks the same way. Verified against sqlite: unlinking leaves the task row and its edited title intact.

**Finding the way back.** A task promoted from a line shows a FROM NOTE field in [[Task Detail]] that opens the note, and the note lists its own tasks under the ledger. The relationship is navigable in both directions.

Notes are reached from a "Notes" row in [[Settings]] and [[Profile]], listed newest-touched-first.

## Decisions taken
- **A promoted line is dated today, not left undated.** Everything else dateless lands on [[Unfiled]], but writing a checkbox is an explicit commitment, and the feature's promise is that it appears on Today. It can be moved from there like any other row.
- **One `TextInput` per line, not a single body field.** A single field would be a nicer typing experience and would make stable line identity impossible. Identity is the feature.

## Not done here
[[Search Results]] still returns mock results. Its tasks / notes filters assume both exist and now both do, but making search read the database is its own piece of work on a screen that is entirely literals today — it is not part of this feature and is not claimed by it.

## Related
- Page: [[Task Detail]], [[Search Results]], [[Today]], [[Notes]], [[Note]], [[Settings]], [[Profile]]
- Features: [[Offline First Local Store]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]], [[Expanding Search Field]], [[Ink Strike-Through Completion]], [[Inbox Triage Chips]]
- Bugs: [[Task And Subtask Ids Share One Done Map]]
