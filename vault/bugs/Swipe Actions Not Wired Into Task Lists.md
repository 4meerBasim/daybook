# Swipe Actions Not Wired Into Task Lists

Status: fixed
Found: `src/screens/TodayScreen.tsx:49`, also `UpcomingScreen.tsx:58` and the since-deleted `InboxScreen.tsx:33`
Summary: `SwipeableRow` was only mounted on the gesture reference screen, so complete/snooze/pick-date/delete swipes did not work on any real task list.

## Details
[[Swipe Row Actions]] was fully implemented in `src/components/SwipeableRow.tsx` — pan gesture, four thresholds, three action layers, haptics, RTL sign flip, long-press lift. But the only file importing it was `SwipeStatesScreen.tsx`, which used it to freeze three demo rows at fixed offsets.

Fixed by wrapping each [[Today]] row in `SwipeableRow`. `onComplete` calls the existing `toggle(k.id)`; snooze and delete both call a new `clear(id)` store action that takes the task off today's page; pick-date navigates to [[Calendar]]. `TaskRow` gained a `rule` prop so the wrapper owns the ledger line and the rule stays put while the face slides, matching the mock.

`SwipeStatesScreen` no longer drives `SwipeableRow` with a demo-only `offset` prop — it now renders its own static illustration with the pane hardcoded per row, as the mock does. This also fixed two defects in that screen: the third row showed the blue snooze pane instead of the vermilion delete pane (a -200pt offset on a ~390pt row is 51%, below the 70% delete threshold), and touching any demo row snapped it back to zero, destroying the illustration.

[[Upcoming]] and [[Project Detail]] were the lists this fix had missed, so a task could be ticked only on [[Today]]. Upcoming drew bare `LedgerRow`s with static checkboxes and no `onToggle`; Project hand-rolled its own completion markup with long-press-to-assign but no toggle either. Both now wrap each row in `SwipeableRow` + `TaskRow`, so a leading swipe or a checkbox tap calls `complete(id, done)` and a 70% trailing swipe calls `remove(id)`, with the same two actions mirrored as `accessibilityActions`. The Inbox half is moot: that screen was deleted in the tab-bar redesign and never got swipe.

Snooze and pick-date are deliberately absent from these two lists. `snoozeTask` writes `snoozedUntil`, which only `selectToday` reads and only for a row already due today, so it is a silent no-op on a future-dated Upcoming or Project task; pick-date routes to [[Calendar]], which takes no task and has no write path, so it is inert app-wide. `onSnooze`/`onPickDate` are therefore left off [[Swipe Row Actions]] on these screens — `onSnooze` was made optional to match `onPickDate`, which already was. [[Calendar]]'s own selected-day rows are handled by the Calendar rework rather than here — they become tap-completable there, with no swipe, since delete was never wired on that screen and the other two actions are inert on it.

One consequence is worth stating plainly, because the two lists differ: on [[Project Detail]] a ticked row stays and strikes, but on [[Upcoming]] it cannot. `selectUpcoming` filters `completedAt IS NULL`, so every row that screen can render is incomplete by definition — ticking one commits the completion and the row leaves on the next reload, before the ink could draw. Completion is one-way there, and the `done` plumbing is omitted rather than left as dead wiring that reads as if it works. The recovery path is [[Lift The Ink]]; until it exists, [[Calendar]] can un-tick a task inside the current month because `selectMonth` does not filter completed rows.

## Related
- Feature: [[Swipe Row Actions]], [[Offline First Local Store]]
- Page: [[Swipe States]], [[Today]], [[Upcoming]], [[Project Detail]]
- Bugs: [[Snooze And Delete Share One Cleared Map]]
