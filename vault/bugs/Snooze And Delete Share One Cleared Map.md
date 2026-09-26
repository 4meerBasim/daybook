# Snooze And Delete Share One Cleared Map

Status: fixed
Found: `src/screens/TodayScreen.tsx:64-65`
Summary: The snooze and delete swipes both wrote the same `cleared` map, so the two actions were indistinguishable and a snoozed task was as gone as a deleted one.

## Details
[[Swipe Row Actions]] commits four different actions at four different thresholds, and [[Today]] wired two of them to the same call:

```
onSnooze={() => clear(k.id)}
onDelete={() => clear(k.id)}
```

`clear` set one boolean in a `cleared` record on `src/state/store.tsx`, and the list filtered any id present in it. So snoozing a task erased it exactly as deleting did — no return time, no way back, and no distinction anywhere in the data. The screen-reader `accessibilityActions` handler had the same collapse.

The two actions mean different things:

- **Snooze** hides a task until a time. It still exists, still belongs to its day, still counts in the month tallies on [[Calendar]].
- **Delete** removes it from every list, but as a soft delete so it can come back.

Fixed by giving them separate columns in [[Offline First Local Store]]. `snooze(id, offset)` writes `snoozedUntil`, and the [[Today]] query admits a row only when `snoozedUntil IS NULL OR snoozedUntil <= now`. `remove(id)` writes `deletedAt`, and every list query filters `deletedAt IS NULL`. `restore(id)` clears `deletedAt`.

The offsets live in `src/db/reminders.ts` as named constants — ten minutes, one hour, and tomorrow — matching the snooze actions the mock draws on the [[Task Detail]] reminder row and on the swipe pane. The swipe uses `tomorrow`.

Snooze deliberately leaves `dueDate` alone. The task is still due today; it is only hidden until tomorrow, which is why it resurfaces as overdue rather than silently rescheduling itself. Moving the due date is what pick-date is for.

Verified on web: swiping a row to the snooze threshold removed it from [[Today]] and the remaining count dropped, while the row was still listed under today's date on [[Calendar]]. Swiping a different row past the delete threshold removed it from both.

## Related
- Feature: [[Swipe Row Actions]], [[Offline First Local Store]]
- Page: [[Today]], [[Calendar]], [[Swipe States]]
- Bugs: [[Task And Subtask Ids Share One Done Map]]
- Enhancements: [[Waiting On Follow-Ups]], [[Closing the Page Ritual]]
