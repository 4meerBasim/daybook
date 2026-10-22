# Upcoming

Route: `Main` → tab key `upcoming` (second pane)
Summary: Scheduled work grouped by horizon — tomorrow, this week, later — each group headed by an italic display title, its day range and a count.

## Related
- Connects to: [[Main Tabs]], [[Today]], [[Profile]] — the sibling panes it slides between, [[Calendar]] — long-press the Upcoming tab, [[Quick Add Sheet]] — the Add item in the bar, [[Search Results]] — the overlay that covers this pane, [[Task Detail]] — long-press a task row, [[Unfiled]] — the tomorrow swipe on an Unfiled row sets a due date, so the capture lands here
- Features: [[Offline First Local Store]], [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Glass Tab Bar]], [[Animated Page Transitions]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]], [[Undated Unassigned Tasks Have No Screen]], [[Calendar Overflow Is Unreachable]]
- Enhancements: [[Closing the Page Ritual]], [[Ink Decay and Task Retirement]], [[Weekly Spread Review]]

## Notes
`src/screens/UpcomingScreen.tsx`, reading the `upcoming` snapshot from [[Offline First Local Store]] — open tasks dated from tomorrow onward, ordered by due date. The screen buckets them into three horizons rather than the mock's tomorrow / named weekday / next week, because the horizons are derivable from real dates without a weekday-name table: `t.tomorrow`, `t.weekGroup` for the following six days, and `t.laterGroup` beyond that. An empty bucket is dropped rather than drawn.

Each header's mono sub-label is the day-of-month range of the rows actually in that group, and the count is their length — both derived, where the old seed carried them as strings. Row meta is the time of day when the task has one; an all-day task shows nothing, since the group header already states the day.

Anything [[Natural Language Quick Add]] parses with a day lands here, which is what the sheet's "Saved to Upcoming" chip promises. It is now the only destination the sheet can promise: the dateless half of the parser's output has nowhere to land since the Inbox was removed — see [[Undated Unassigned Tasks Have No Screen]]. Each row is now a [[Swipe Row Actions]] wrapper around a `TaskRow`, the same pairing [[Today]] uses, so a leading swipe or a checkbox tap completes the task and a trailing swipe deletes it — both mirrored as `accessibilityActions`, with a long-press opening [[Task Detail]]. Completed rows strike through with [[Ink Strike-Through Completion]]'s animated ink. Snooze and pick-date are left off: snooze does nothing to a future-dated task, and pick-date has nowhere to write until [[Calendar]] is reworked, so neither `onSnooze` nor `onPickDate` is passed here. The group headers are untouched — they are chrome, so they hold one line at `minHeight: unit`.
