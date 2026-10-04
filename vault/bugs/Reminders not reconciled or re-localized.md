# Reminders not reconciled or re-localized

Status: fixed
Found: src/lib/notifications.ts + src/screens/SettingsScreen.tsx
Summary: Scheduled daily reminders are not reconciled with the OS schedule on launch, and their text is frozen in the language active when the toggle was flipped.

## Details
The daily journaling reminder and the On This Day alert are driven by persisted prefs (`reminderEnabled` / `onThisDayEnabled` / `reminderTime`), but nothing re-runs `scheduleDailyReminder` or reconciles against `getAllScheduledNotificationsAsync()` on app launch, so the OS schedule can drift from the stored prefs (e.g. after an OS clear). The notification title/body are captured in the app language active when the toggle is flipped; switching the app language later does not reschedule, so the notification keeps the stale language.

Fixed: `src/hooks/useReminderSync.ts` reconciles OS notifications with stored state on launch and re-schedules with the current language on language change (task and journaling reminders), via `reconcileReminders` in `src/lib/notifications.ts`.

## Related
- Feature: [[Local reminders]], [[Journaling streak + nudge]], [[Local notification module]]
- Page: [[Settings]]
