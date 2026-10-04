# Recurring tasks

Status: shipped
Summary: Let a task repeat on a schedule so it regenerates after completion.

## Details
`src/lib/recurrence.ts` defines the recurrence rules — daily, weekly on chosen days, monthly, every-N, and an after-completion mode — edited through `src/components/RecurrenceEditor.tsx` on [[Task Detail]]. `setRecurrence` (and the toggle that advances after completion) live in `src/state/store.tsx`: completing a recurring task advances it to its next occurrence, and its [[Local reminders]] follow the new date. Repeat tokens are also recognised by `src/lib/parse.ts` so a recurrence can be entered from [[Quick Add Sheet]].

## Related
- Page: [[Task Detail]], [[Quick Add Sheet]]
- Features: [[Due-date picker]], [[Local reminders]]
