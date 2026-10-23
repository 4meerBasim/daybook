# Waiting On Follow-Ups

Status: shipped
Summary: A defer that asks who the task is with, records the answer, and resurfaces it on its own nudge date instead of its original due date.

## Details
Snoozing hides work; a ledger should record who owes what. Schema v7 adds three columns to `tasks`: `blockedBy TEXT` (who it is with), `blockedAt` (when it was handed over, set once and preserved across edits), and `nudgeAt` (when it comes back). A partial index covers the blocked rows by nudge date.

**The question.** `WaitingSheet` asks "Who is it with?" with a nudge interval beside it — 1, 3 or 7 days, with the resolved date spelled out next to the segmented control so the choice is not abstract. It opens from two places:

- [[Task Detail]]'s WAITING ON field, which shows the name and nudge date, or "Not waiting".
- The trailing swipe on [[Today]] at 55%.

**What the 55% swipe used to be.** It was "pick date", and it navigated to [[Calendar]] — which cannot write a date, so the action did nothing but move the user to a read-only screen. [[Upcoming]] documents this: `onPickDate` was deliberately left off there because it "has nowhere to write". Replacing a non-functional slot with a real write is the honest use of that gesture, so `SwipeableRow`'s prop is renamed `onWaiting` and the pane reads WAITING ON. The `pickDate` string is gone, and [[Swipe States]] documents the new threshold.

**Where blocked rows live.** A blocked row drops out of [[Today]] and [[Upcoming]] until its nudge date passes — both queries gained `(blockedBy IS NULL OR nudgeAt IS NULL OR nudgeAt <= $now)`. It is never invisible, though: `selectWaiting` lists every blocked row in a WAITING ON section on [[Unfiled]], ordered by nudge date, each row showing the blocker's name in its meta slot and carrying a "Not waiting" chip to clear the block. That is the cheapest host the note identified, and it puts waiting-on next to Someday where both kinds of set-aside work read together.

Once the nudge fires the row returns to [[Today]] still flagged — the meta slot shows the blocker's name instead of the time, so it reads as "Nadia still owes you this" rather than as a fresh task.

**The carry count does not punish the user for someone else's delay.** This is the problem the note raised against [[Closing the Page Ritual]], and it is solved in the SQL rather than in the UI:

```sql
carryCount = carryCount + (blockedBy IS NULL)
```

Carrying an unblocked row increments; carrying a blocked one does not, and the carry also pushes `nudgeAt` forward to the new day so the row stays hidden until it is due again. Verified against sqlite directly: a blocked row at 2 carries stays at 2, an identical unblocked row goes to 3.

## Decisions taken
- **People are not entities.** `blockedBy` is free text. A collaborator model needs identity, dedup and a picker, and the only hint of one in the design is the decorative avatar row on [[Project Detail]]. A name on the row delivers the whole feature; a `people` table would deliver a schema.
- **The plain snooze is untouched.** Making every snooze ask a question would turn a one-gesture action into a dialogue. The 30% swipe still snoozes to tomorrow with no questions; the 55% swipe is the one that asks.
- **Nudges do not notify yet.** The date is recorded and the row resurfaces in-app on time. Scheduling an actual notification for it belongs to [[Adaptive Reminders]], which owns the notification dependency.

## Related
- Page: [[Today]], [[Task Detail]], [[Swipe States]], [[Unfiled]], [[Project Detail]], [[Calendar]]
- Features: [[Swipe Row Actions]], [[Offline First Local Store]], [[Closing the Page Ritual]], [[Inbox Triage Chips]], [[Ink Decay and Task Retirement]]
- Bugs: [[Snooze And Delete Share One Cleared Map]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Adaptive Reminders]]
