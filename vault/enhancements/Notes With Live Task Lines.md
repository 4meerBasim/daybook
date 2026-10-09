# Notes With Live Task Lines

Status: planned
Summary: Checkbox lines written inside a note are real tasks — they appear in Today, and completing either side updates the other.

## Notes
This is what collapses the note-app / task-app split that makes people carry two apps. A note is where thinking happens; the commitments inside it should not have to be re-entered somewhere else. One substance, two views.

[[Task Detail]] already carries a note body and checkable subtasks as separate blocks, and [[Search Results]] already filters across "tasks" and "notes" as though both exist — the vocabulary is in the design even though nothing connects them.

Open decisions:

- Notes are not a first-class object anywhere yet. [[Offline First Local Store]] gives every task a `notes` column, but that is a body hanging off a task, not a note record with its own identity — and the seeded invoice task deliberately leaves it null so the mock's note body keeps switching language.
- Editing model: a task line inside a note needs an identity that survives the user rewriting the text around it. This is the hard part, and it is a data-layer decision rather than a UI one.
- Two-way sync means striking a task in [[Today]] edits text inside the note. What happens when the user deletes the line instead is a product call.
- Rendering checkbox syntax inside body text wants the same live-highlight approach `src/lib/parse.ts` uses for the [[Quick Add Sheet]], applied to a multi-line field.

## Related
- Page: [[Task Detail]], [[Search Results]], [[Today]]
- Features: [[Offline First Local Store]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]], [[Expanding Search Field]] — the surface whose tasks / notes filters already assume both exist
- Bugs: [[Task And Subtask Ids Share One Done Map]]
