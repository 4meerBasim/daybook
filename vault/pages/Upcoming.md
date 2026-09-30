# Upcoming

Route: `Main` → tab key `upcoming`
Summary: Scheduled work grouped by project — one row per project that has upcoming tasks, each with a done/total count.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap a project row, [[Calendar]] — long-press the Upcoming tab, [[Quick Add Sheet]] — pen FAB
- Features: [[Project Grouped Tasks]], [[Inline Page Search]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[Natural Language Quick Add]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: none

## Notes
`src/screens/UpcomingScreen.tsx`. The page renders `ProjectRows` for the `upcoming` list and four empty rules — see [[Project Grouped Tasks]]. The italic day-group headings (tomorrow, Sunday, next week) and their counts are gone; the day now travels on each task as its `meta` ("Tomorrow · 15:00", "Tue") and is shown on the task row in [[Project Detail]]. This is where [[Natural Language Quick Add]] puts a task with a date other than today.
