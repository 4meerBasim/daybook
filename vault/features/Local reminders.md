# Local reminders

Status: shipped
Summary: Fire an on-device notification when a task's reminder time arrives, with the Settings reminders now functional.

## Details
Per-task reminders are scheduled through `src/lib/notifications.ts` and set from [[Task Detail]] via `setTaskReminder` in `src/state/store.tsx`. `src/hooks/useReminderSync.ts`, mounted in `App.tsx`, reconciles the OS notification schedule with stored state on launch and re-localises scheduled notifications when the app language changes. The reminder toggles on [[Settings]] (`src/screens/SettingsScreen.tsx`) are now wired to real scheduling. Reminders follow a task's due date and recurrence.

## Related
- Page: [[Task Detail]], [[Settings]]
- Features: [[Due-date picker]], [[Recurring tasks]], [[Local notification module]]
- Bugs: [[Reminders not reconciled or re-localized]], [[Expo Go crashes on launch from native-only modules]]
