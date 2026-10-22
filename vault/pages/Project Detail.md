# Project Detail

Route: `Project` (native stack, `{ projectId }`)
Summary: One project's page — its own name, a derived progress count, tag chips read off its tasks, and its rows split into "this week" and "later".

## Related
- Connects to: [[Projects]] — tap a project row; returns via the system back gesture, [[Search Results]] — reached by tapping the `#invoice` tag result in the search overlay, [[Project Picker]] — long-press a row, its only caller now, [[Main Tabs]], [[Task Detail]], [[Unfiled]] — shares this screen's stack-screen header pattern
- Features: [[Projects As A Real Entity]], [[Offline First Local Store]], [[Expanding Search Field]] — the tag result that opens this page, [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Ink Stroke Spans The Whole Title Column]], [[Stack Screens Ignore The Bottom Safe Area]], [[Stack Screens Reserve Tab Bar Space]] — the gutter padding this screen already got right
- Enhancements: [[Waiting On Follow-Ups]], [[Shared Page Link]], [[Inbox Triage Chips]] — the long-press half that now only works here

## Notes
`src/screens/ProjectScreen.tsx`. The route carries a `projectId` now, so the screen reads a real row: the eyebrow dot takes the project's own colour, the name is `projectName(project, t)` — the stored name, or the i18n string while the seeded project still carries its `seedKey` — and the fraction counts the rows on screen. Until the store has loaded, the project is simply not found yet and the screen renders bare paper.

Its tasks come from the `assigned` snapshot filtered by id, ordered by due date with undated rows last, which is the same array [[Projects]] derives its fractions from.

Three things stopped being literals. The `7 / 12` became `completed / total`. The `LATER · 5` became a real split — anything due inside the next seven days sits under `THIS WEEK`, everything later or undated sits under `LATER · n` — and each heading only renders when its group has rows, since a real list can be empty on either side. The `#design` and `#invoice` chips became the union of the tags on this project's tasks, tinted by `tagColors`, which reproduces the mock's exact pairing for those two tags and keeps working for tags the user invents. The chip row wraps when a project collects more than a couple of tags, rather than squeezing every chip into an ellipsis.

The `LM` / `NA` circles and the "shared with Nadia" line render for the seeded Studio project only. There is no collaborator entity and no sharing — see [[Shared Page Link]] — so for a project the user made, that whole cluster is absent and the tags sit alone on the row.

Row meta is derived — the time of day when a task has one, otherwise its day-of-month, where the mock drew weekday abbreviations. The row is a `TaskRow` now, so a completed task animates the ink stroke exactly as [[Today]] does rather than keeping this screen's old static copy of the bar — the duplicated markup, the `textWidth` state and the `onLayout` that measured it are gone, so [[Ink Strike-Through Completion]]'s strike-width behaviour lives in one place and no longer has to be fixed twice. A task whose name wraps still falls back to a plain line-through.

Long-pressing a row still opens [[Project Picker]], now through [[Swipe Row Actions]]' `onLongPress`, which is where an assignment is cleared; the row keeps its `assign` accessibility action and its move-to-project hint. Completion is now wired: a checkbox tap or a leading swipe calls `complete(id, done)`, and a trailing swipe calls `remove(id)`. Snooze and pick-date are deliberately left off — snooze is a no-op on a task not due today, and pick-date has no write path until the calendar screen is reworked — so this screen passes neither callback and exposes only complete, delete and assign to screen readers.

One edge: [[Search Results]]'s tag result always opens the seeded project by id, so if the user deletes Studio that result leads to a blank page until it is given a real target.
