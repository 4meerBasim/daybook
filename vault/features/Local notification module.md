# Local notification module

Status: shipped
Summary: A reusable expo-notifications wrapper — permissions plus daily scheduling by stable id — used by the daily writing reminder and On This Day alerts, and built to be reused by Phase 3 task reminders.

## Details
`src/lib/notifications.ts`. Sets a foreground notification handler and exposes `requestNotificationPermission()`, `scheduleDailyReminder(id, { hour, minute }, { title, body })` (cancels any existing id first, then schedules a `DAILY` trigger), `cancelReminder(id)` and `isReminderScheduled(id)`; all are web-safe and failure-safe (return `false` or no-op on web or error). Stable ids live in `REMINDER_IDS` (`journal`, `onThisDay`). Wired from [[Settings]] (`src/screens/SettingsScreen.tsx`) to toggle the journaling reminder and the On This Day alert.

## Related
- Page: [[Settings]]
- Features: [[Journaling streak + nudge]], [[On This Day]]
- Bugs: [[Reminders not reconciled or re-localized]]
