# Adaptive Reminders

Status: shipped
Summary: A reminder that keeps being ignored moves itself later and says so, and a task marked insistent can only be escaped by writing one line about why.

## Details
`expo-notifications` is now a dependency and an app.json plugin — the first one this project has needed. Local scheduling only, no push tokens and no accounts, which is the constraint [[Offline First Local Store]] sets.

**Schema v9** adds `insistent`, `dismissCount`, `reminderShift` (minutes) and `escapeNote` to `tasks`, plus a partial index on `reminderAt` for live rows. `reminderAt` itself already existed and was being displayed without ever being written.

**The dismissal signal, without an OS dismiss event.** Neither platform reports "user swiped the notification away" reliably. The signal is computed locally instead: on launch, any live task whose `reminderAt` is **before the start of today** counts as one dismissal and is pushed to the next day. Narrowing it to a previous day matters — a reminder that fired an hour ago is probably why the app is open right now, and counting that as a dismissal would punish the user for responding.

**The adaptive rule, kept legible.** Three dismissals shift the reminder two hours later, capped at eight hours from the default, and reset the counter. The shift is never silent: [[Task Detail]] grows a row reading "moved to 11:00" whenever `reminderShift` is non-zero, which is exactly the visible note the enhancement asked for instead of magic.

**Insistent mode.** Opt-in per task from a toggle in [[Task Detail]], as the note required. An insistent reminder is sticky and goes to a high-importance Android channel. Tapping it opens `EscapeSheet`, which offers two exits and no third:

- **Do it** — dismisses the sheet and leaves the task where it is.
- **Escape it** — enabled only once a line has actually been written. The line is stored in `escapeNote` and the reminder moves to tomorrow morning.

The sheet has no cancel, but it is not a trap: "Do it" is always available, and the whole mode is per-task opt-in. The escape line then shows on [[Task Detail]] as part of the task's record — the same principle as the carry count in [[Closing the Page Ritual]], applied to notifications.

**Waiting-on nudges now notify.** [[Waiting On Follow-Ups]] recorded `nudgeAt` and resurfaced the row in-app but could not notify. The scheduler now also schedules a `nudge-<id>` notification per blocked task, bodied with the blocker's name.

**Settings.** The reminders row was a static `09:00 · evening review 20:30` label. It is a real toggle that requests permission and only turns on if permission was granted; turning it off cancels every scheduled notification. The schedule is rebuilt from the `reminders` slice whenever the store's revision advances, so every write keeps the OS queue in step — cancel-all then reschedule, which keeps one source of truth rather than tracking individual identifiers.

## Decisions taken
- **Reminder times are four fixed hours**, not a free time picker: 07:00, 09:00, 13:00, 18:00 on the task's own due date, through the same `Segmented` control the rest of [[Task Detail]] uses. A wheel picker is a dependency and a modal for a choice that is nearly always "morning" or "evening".
- **Cancel-all-and-reschedule on every revision.** Diffing the OS queue against the table would be fewer calls and one more thing to get wrong; the queue is small because it only holds live reminders.
- **No evening review notification.** The old label promised one, but a daily nudge to close the page is a different feature from a per-task reminder, and [[Closing the Page Ritual]] does not need a notification to work.

## Related
- Page: [[Settings]], [[Profile]], [[Task Detail]], [[Today]]
- Features: [[Offline First Local Store]], [[Closing the Page Ritual]], [[Waiting On Follow-Ups]], [[Ink Decay and Task Retirement]]
- Enhancements: [[Focus Live Activity and Widgets]]
