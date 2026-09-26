# Waiting On Follow-Ups

Status: planned
Summary: A defer that asks what is blocking the task, and turns a person-shaped blocker into a follow-up entry with its own nudge date.

## Notes
A real gap in every mainstream task app: work that is not the user's to do right now. Snoozing hides it; a ledger should record who owes what. When the blocker is a person, the task moves to a "waiting on" section carrying the name and the date it was handed over, and resurfaces on its own schedule rather than the original due date.

The existing snooze swipe is the natural entry point — [[Swipe Row Actions]] moves a row into the `cleared` map today, which is exactly the wrong behaviour here: the task vanishes and stops counting. A snooze that asks one question instead is a small interaction change with a large product difference.

Open decisions:

- Where waiting-on items live: a section on [[Inbox]], a filter, or their own page. The design has no screen for it.
- Whether people are real entities. [[Project Detail]] already shows shared avatars, so there is a hint of a collaborator model with nothing behind it.
- Follow-up dates imply notifications, which ties this to [[Adaptive Reminders]].
- Closing a page has to treat waiting-on items differently from carried ones, or the carry count punishes the user for someone else's delay — see [[Closing the Page Ritual]].

## Related
- Page: [[Inbox]], [[Task Detail]], [[Swipe States]], [[Project Detail]]
- Features: [[Swipe Row Actions]]
- Enhancements: [[Closing the Page Ritual]], [[Adaptive Reminders]]
