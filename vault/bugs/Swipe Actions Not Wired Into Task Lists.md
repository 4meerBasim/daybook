# Swipe Actions Not Wired Into Task Lists

Status: fixed
Found: `src/screens/TodayScreen.tsx:49`, also `InboxScreen.tsx:33` and `UpcomingScreen.tsx:58`
Summary: `SwipeableRow` was only mounted on the gesture reference screen, so complete/snooze/pick-date/delete swipes did not work on any real task list.

## Details
[[Swipe Row Actions]] was fully implemented in `src/components/SwipeableRow.tsx` — pan gesture, four thresholds, three action layers, haptics, RTL sign flip, long-press lift. But the only file importing it was `SwipeStatesScreen.tsx`, which used it to freeze three demo rows at fixed offsets.

Fixed by wrapping each [[Today]] row in `SwipeableRow`. `onComplete` calls the existing `toggle(k.id)`; snooze and delete both call a new `clear(id)` store action that takes the task off today's page; pick-date navigates to [[Calendar]]. `TaskRow` gained a `rule` prop so the wrapper owns the ledger line and the rule stays put while the face slides, matching the mock.

`SwipeStatesScreen` no longer drives `SwipeableRow` with a demo-only `offset` prop — it now renders its own static illustration with the pane hardcoded per row, as the mock does. This also fixed two defects in that screen: the third row showed the blue snooze pane instead of the vermilion delete pane (a -200pt offset on a ~390pt row is 51%, below the 70% delete threshold), and touching any demo row snapped it back to zero, destroying the illustration.

[[Inbox]] and [[Upcoming]] were deliberately left without swipe. The mock specifies one-tap triage chips and long-press-for-project on Inbox, and day sub-headings on Upcoming; neither note mentions swipe, and their seed rows carry no stable ids.

Since [[Project Grouped Tasks]] the three tabs list projects rather than tasks, so the swipeable rows described above now live on [[Project Detail]], with the same wiring, and cover Upcoming and Inbox tasks as well as Today's. The fix stands; only its location moved.

## Related
- Feature: [[Swipe Row Actions]], [[Project Grouped Tasks]]
- Page: [[Swipe States]], [[Project Detail]], [[Today]], [[Inbox]], [[Upcoming]]
