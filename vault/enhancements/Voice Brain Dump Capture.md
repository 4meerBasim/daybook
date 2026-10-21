# Voice Brain Dump Capture

Status: planned
Summary: One rambling ninety-second recording becomes a structured page of tasks with dates and projects, with the original audio kept attached.

## Notes
Capture is the moment apps lose people — typing seven tasks one at a time is why things never get written down. Speaking them once and letting the parser sort them out is a materially different experience, and keeping the raw audio means nothing is lost when the parse is imperfect.

[[Natural Language Quick Add]] already owns the parsing vocabulary and the live-highlight treatment in `src/lib/parse.ts`; this is the same pipeline with a different input and a multi-item output. The parse stays invisible — the user sees a page of tasks, not a model.

Open decisions:

- Transcription route: on-device speech recognition or server-side. On-device is free and private but weaker on Arabic, which matters given [[In-App RTL and Arabic Typography]] is a first-class concern in this app.
- Output needs review before commit — a confirmation sheet listing the parsed tasks, since a bad parse dumping twelve wrong rows into the list is worse than typing. Worse still right now: anything parsed without a day is inserted where no screen will show it, so the user could neither see nor undo it — [[Undated Unassigned Tasks Have No Screen]].
- Multi-item output has nowhere to land while [[Quick Add Does Not Create Tasks]] is open.
- Audio attachments imply file storage. [[Task Detail]] draws an attachment row already, but nothing backs it.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Task Detail]]
- Features: [[Natural Language Quick Add]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Inbox Triage Chips]], [[System Capture Entry Points]]
