# Project Detail

Route: `Project` (native stack)
Summary: The Studio project page — a derived progress count, shared avatars, tag chips, and the project's tasks split into "this week" and "later".

## Related
- Connects to: [[Search]] — reached by tapping the `#invoice` tag result; returns via the system back gesture, [[Main Tabs]], [[Task Detail]]
- Features: [[Offline First Local Store]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]]
- Enhancements: [[Waiting On Follow-Ups]], [[Shared Page Link]]

## Notes
`src/screens/ProjectScreen.tsx`, reading the `project` snapshot from [[Offline First Local Store]] — every non-deleted task carrying the Studio `projectId`, ordered by due date so the finished groundwork sits above the open work exactly as the mock draws it. Undated project tasks sort last.

The `7 / 12` in the header is now `completed / total` over those rows, which reads `2 / 4` against the seeded project. That is a visible change from the mock, and the honest one: the count is backed by the rows on screen instead of being a literal. The `Later · 5` section label is still literal, because nothing in the schema splits a project into horizons.

Row meta is derived — the time of day when a task has one, otherwise its day-of-month, where the mock drew weekday abbreviations. Completed rows draw the ink stroke statically at the measured text width rather than animating it — same visual as [[Ink Strike-Through Completion]] at its end state, including its length bug, [[Ink Stroke Spans The Whole Title Column]]. A project task whose name wraps takes a second ruling unit and falls back to a plain line-through, the same rule [[Today]] follows. The first unfinished row is the same task that [[Task Detail]] expands, and it is now literally the same record.
