# Project Detail

Route: `Project` (native stack, `{ projectId }`)
Summary: One project's page — its own name, a derived progress count, tag chips read off its tasks, and its rows split into "this week" and "later".

## Related
- Connects to: [[Projects]] — tap a project row; returns via the system back gesture, [[Search Results]] — reached by tapping the `#invoice` tag result in the search overlay, [[Project Picker]] — long-press a row, its only caller now, [[Main Tabs]], [[Task Detail]]
- Features: [[Projects As A Real Entity]], [[Offline First Local Store]], [[Expanding Search Field]] — the tag result that opens this page, [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Ink Stroke Spans The Whole Title Column]]
- Enhancements: [[Waiting On Follow-Ups]], [[Shared Page Link]], [[Inbox Triage Chips]] — the long-press half that now only works here

## Notes
`src/screens/ProjectScreen.tsx`. The route carries a `projectId` now, so the screen reads a real row: the eyebrow dot takes the project's own colour, the name is `projectName(project, t)` — the stored name, or the i18n string while the seeded project still carries its `seedKey` — and the fraction counts the rows on screen. Until the store has loaded, the project is simply not found yet and the screen renders bare paper.

Its tasks come from the `assigned` snapshot filtered by id, ordered by due date with undated rows last, which is the same array [[Projects]] derives its fractions from.

Three things stopped being literals. The `7 / 12` became `completed / total`. The `LATER · 5` became a real split — anything due inside the next seven days sits under `THIS WEEK`, everything later or undated sits under `LATER · n` — and each heading only renders when its group has rows, since a real list can be empty on either side. The `#design` and `#invoice` chips became the union of the tags on this project's tasks, tinted by `tagColors`, which reproduces the mock's exact pairing for those two tags and keeps working for tags the user invents. The chip row wraps when a project collects more than a couple of tags, rather than squeezing every chip into an ellipsis.

The `LM` / `NA` circles and the "shared with Nadia" line render for the seeded Studio project only. There is no collaborator entity and no sharing — see [[Shared Page Link]] — so for a project the user made, that whole cluster is absent and the tags sit alone on the row.

Row meta is derived — the time of day when a task has one, otherwise its day-of-month, where the mock drew weekday abbreviations. Completed rows stay on the page in ink-3 and draw the ink stroke statically at the measured text width rather than animating it — same visual as [[Ink Strike-Through Completion]] at its end state, including its length bug, [[Ink Stroke Spans The Whole Title Column]]. A task whose name wraps takes a second ruling unit and falls back to a plain line-through, the same rule [[Today]] follows.

Long-pressing a row opens [[Project Picker]], which is where an assignment is cleared; the row also carries an `assign` accessibility action. Tapping a row does nothing — completion on this page is not wired, exactly as the mock draws it.

One edge: [[Search Results]]'s tag result always opens the seeded project by id, so if the user deletes Studio that result leads to a blank page until it is given a real target.
