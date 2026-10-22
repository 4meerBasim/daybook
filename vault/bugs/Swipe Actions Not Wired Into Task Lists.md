# Swipe Actions Not Wired Into Task Lists

Status: fixed
Found: `src/screens/TodayScreen.tsx:49`, also `UpcomingScreen.tsx:58` and the since-deleted `InboxScreen.tsx:33`
Summary: `SwipeableRow` was only mounted on the gesture reference screen, so complete/snooze/pick-date/delete swipes did not work on any real task list.

## Details
[[Swipe Row Actions]] was fully implemented in `src/components/SwipeableRow.tsx` — pan gesture, four thresholds, three action layers, haptics, RTL sign flip, long-press lift. But the only file importing it was `SwipeStatesScreen.tsx`, which used it to freeze three demo rows at fixed offsets.

Fixed by wrapping each [[Today]] row in `SwipeableRow`. `onComplete` calls the existing `toggle(k.id)`; snooze and delete both call a new `clear(id)` store action that takes the task off today's page; pick-date navigates to [[Calendar]]. `TaskRow` gained a `rule` prop so the wrapper owns the ledger line and the rule stays put while the face slides, matching the mock.

`SwipeStatesScreen` no longer drives `SwipeableRow` with a demo-only `offset` prop — it now renders its own static illustration with the pane hardcoded per row, as the mock does. This also fixed two defects in that screen: the third row showed the blue snooze pane instead of the vermilion delete pane (a -200pt offset on a ~390pt row is 51%, below the 70% delete threshold), and touching any demo row snapped it back to zero, destroying the illustration.

The Inbox and [[Upcoming]] were deliberately left without swipe. The mock specifies one-tap triage chips and long-press-for-project on Inbox, and day sub-headings on Upcoming; neither note mentions swipe. The rows do now carry stable ids — [[Offline First Local Store]] gave every list the same task table — so the only thing still keeping swipe off [[Upcoming]] is the design, not the data. The Inbox half is moot: that screen was deleted in the tab-bar redesign and never got swipe.

[[Calendar]]'s selected-day rows became tap-completable in `fix/calendar-real-month` — they render through `TaskRow` wired to the store's `complete` — but deliberately carry no swipe, since snooze and pick-date are inert on that screen.

## Related
- Feature: [[Swipe Row Actions]], [[Offline First Local Store]]
- Page: [[Swipe States]], [[Today]], [[Upcoming]], [[Calendar]]
- Bugs: [[Snooze And Delete Share One Cleared Map]]
