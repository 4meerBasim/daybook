# Due-date picker

Status: shipped
Summary: Pick an explicit due date and time for a task — quick options or an exact picker — instead of only typing it in natural language.

## Details
`src/components/DueDatePicker.tsx` offers quick choices (Today, This evening, Tomorrow, Next week, Someday) plus an exact date/time picker. It opens from [[Task Detail]]'s When row and from the swipe "pick date" action, and is reachable while capturing in [[Quick Add Sheet]]. Dates are normalised through `src/lib/day.ts`, persisted in the new `dueAt` column added by the `src/lib/db.ts` migration, and written through `setDue` in `src/state/store.tsx`. Due dates surface on task rows across [[Recent]] and [[Project Detail]].

## Related
- Page: [[Task Detail]], [[Quick Add Sheet]], [[Recent]], [[Project Detail]], [[Calendar]]
- Features: [[Recurring tasks]], [[Local reminders]]
