# Adaptive Reminders

Status: planned
Summary: Reminders that move themselves when they are repeatedly dismissed, and an insistent mode whose only escape is typing one line about why.

## Notes
A reminder dismissed at 9am three days running is not a reminder, it is noise. It should move. The dismissal pattern is the signal, and it is available locally without any server.

The second half is the honest one: for a task the user keeps escaping, escaping costs a sentence. That line becomes part of the task's record — the same principle as the carry count in [[Closing the Page Ritual]], applied to notifications.

Open decisions:

- No notification dependency ships yet (`expo-notifications` is absent), and the reminders row in [[Settings]] is a static preference row with nothing behind it.
- Local scheduling only, if it can be helped — server push would require accounts, which [[Offline First Local Store]] deliberately avoids.
- The adaptive rule has to be legible rather than magic. Probably a visible "moved to 11am" note on the task instead of a silent shift.
- Insistent mode risks being hostile. It should be opt-in per task, from [[Task Detail]].

## Related
- Page: [[Settings]], [[Task Detail]]
- Enhancements: [[Closing the Page Ritual]], [[Waiting On Follow-Ups]], [[Offline First Local Store]]
