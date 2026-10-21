# Waiting On Follow-Ups

Status: planned
Summary: A defer that asks what is blocking the task, and turns a person-shaped blocker into a follow-up entry with its own nudge date.

## Notes
A real gap in every mainstream task app: work that is not the user's to do right now. Snoozing hides it; a ledger should record who owes what. When the blocker is a person, the task moves to a "waiting on" section carrying the name and the date it was handed over, and resurfaces on its own schedule rather than the original due date.

The existing snooze swipe is the natural entry point, and it is now a real snooze rather than a disguised delete: [[Swipe Row Actions]] writes `snoozedUntil`, so the task is hidden until its time and still counts on [[Calendar]] — see [[Snooze And Delete Share One Cleared Map]]. That is the behaviour this enhancement needs underneath it. What it adds is the question: a snooze that asks who is blocking, and records the answer.

Open decisions:

- Where waiting-on items live: a filter, a section on an unfiled list, or their own page. The design has no screen for it, and nothing in [[Offline First Local Store]] marks a task as blocked or names who holds it. The Inbox was the obvious host and it no longer exists — the same vacancy [[Undated Unassigned Tasks Have No Screen]] records, so both want the same answer.
- Whether people are real entities. [[Project Detail]] already shows shared avatars, so there is a hint of a collaborator model with nothing behind it.
- Follow-up dates imply notifications, which ties this to [[Adaptive Reminders]].
- Closing a page has to treat waiting-on items differently from carried ones, or the carry count punishes the user for someone else's delay — see [[Closing the Page Ritual]].

## Related
- Page: [[Today]], [[Task Detail]], [[Swipe States]], [[Project Detail]], [[Calendar]]
- Features: [[Swipe Row Actions]], [[Offline First Local Store]]
- Bugs: [[Snooze And Delete Share One Cleared Map]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Closing the Page Ritual]], [[Adaptive Reminders]]
