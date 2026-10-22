# Today

Route: `Main` → tab key `today` (default tab, first pane)
Summary: The day's ledger page — the tasks due today, a habits section with a streak tally, and a wax "page closed" stamp once everything is struck through.

## Related
- Connects to: [[Main Tabs]], [[Upcoming]], [[Profile]] — the sibling panes it slides between, [[Task Detail]] — long-press any task row, [[Calendar]] — swipe a row past the pick-date threshold, [[Page Closed]] — tap the wax stamp that appears when nothing is left, [[Quick Add Sheet]] — the Add item in the bar, [[Search Results]] — the overlay that covers this pane, [[Settings]] — long-press the Today tab, [[Unfiled]] — the sibling list for captures that never got a date
- Features: [[Offline First Local Store]], [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Wax Page Closed Stamp]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Glass Tab Bar]], [[Animated Page Transitions]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Startup Crash From Mismatched Worklets]], [[Snooze And Delete Share One Cleared Map]], [[Task And Subtask Ids Share One Done Map]], [[Page Header Shows A Frozen Date]], [[Ink Stroke Spans The Whole Title Column]], [[Active Tab Icon Knockout Is Opaque On Glass]], [[Undated Unassigned Tasks Have No Screen]], [[Calendar Overflow Is Unreachable]], [[Native Layout Direction Is Not Pinned]], [[Onboarding Shows On Every Launch]]
- Enhancements: [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ink Decay and Task Retirement]], [[Deal Me One Task Picker]], [[Notes With Live Task Lines]], [[Weekly Spread Review]], [[Focus Live Activity and Widgets]], [[Voice Brain Dump Capture]], [[Waiting On Follow-Ups]], [[Inbox Triage Chips]] — the destination half of the triage model lands here, [[Lift The Ink]]

## Notes
`src/screens/TodayScreen.tsx`, reading the `today` snapshot from [[Offline First Local Store]]. The query takes every task dated before end of day that is not soft-deleted and not snoozed into the future, which means an unfinished overdue task carries onto today's page rather than disappearing — that is the row the mock draws with a vermilion "Yesterday" in place of a time. A task dated in the past that was already completed does not carry.

Completion is `completedAt` on the row, so the header's trailing label derives the remaining count and swaps to "all done" at zero. That is also the condition that reveals the stamp, gated on the store's `loaded` flag so a cold start does not flash it before the first query returns.

Rows are wrapped in [[Swipe Row Actions]]. Snooze and delete are now distinct: snooze writes `snoozedUntil` and hides the row until its time while the task still counts on [[Calendar]]; delete writes `deletedAt` as a soft delete. Both take the row off today's page, so clearing the page by swiping still raises the stamp just as striking every row does.

Row meta is derived, not stored: the time of day when the due date carries one, `t.yesterday` when the due date was yesterday, and nothing for an all-day task. It keeps `numberOfLines={1}` — a wrapped time reads as a mistake — while the title beside it wraps and takes the row with it, two ruling units for two lines. The header's date line is derived too, from `Date.now()` rather than the literal it used to be.

The habit row is a plain `LedgerRow` now rather than its own copy of the row markup, so it grows on the same terms as the tasks above it.

The query is also where undated captures stop being visible: it requires `dueDate IS NOT NULL`, so anything [[Quick Add Sheet]] parses without a day is inserted and never shown. Widening this query is one of the candidate fixes for [[Undated Unassigned Tasks Have No Screen]].
