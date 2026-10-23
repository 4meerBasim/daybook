# Note

Route: `Note` (native stack)
Summary: One note as a ruled page, each line its own editable row, and a line beginning with a checkbox marker becoming a real task.

## Related
- Connects to: [[Notes]] — the list that opens this screen, [[Task Detail]] — tapping one of the note's tasks opens it, and its FROM NOTE field comes back here, [[Today]] — a promoted line appears there as a task, [[Brain Dump]]
- Features: [[Notes With Live Task Lines]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Voice Brain Dump Capture]], [[Shared Page Link]]

## Notes
`src/screens/NoteScreen.tsx`. One `TextInput` per `note_lines` row — the whole point, since a row id is what gives a task line an identity that survives the text around it being rewritten. Each line uses its own `useRuling`, so a wrapping line grows the ruling in step.

A line's checked state is read from its task's `completedAt`, never stored on the line, so there is no state to reconcile. Long-pressing a checkbox demotes the line and leaves the task alive.
