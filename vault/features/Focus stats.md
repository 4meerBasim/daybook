# Focus stats

Status: shipped
Summary: Total focus time, session count and today / this-week breakdowns, shown on Profile.

## Details
Completed focus sessions are now persisted. [[Focus Mode]] (`src/screens/FocusScreen.tsx`) records a session via `addFocusSession` when the Done / check button is pressed, storing the elapsed seconds (with a derived `startedAt`). The `focus_sessions` table (id, taskId, startedAt, seconds, updatedAt, deletedAt; indexed on `startedAt`) is added to `src/lib/db.ts` with `upsertFocusSession` / `deleteFocusSessionRow` writers and hydrated into `StoreSnapshot.focusSessions`. The `FocusSession` type and the `focusSessions` state + `addFocusSession` action live in `src/state/store.tsx`. The `useFocusStats()` selector aggregates total / today / this-week seconds and counts; [[Profile]] shows total focus time and the session count with a this-week figure, localized and themed. See [[Persistence layer]].

## Related
- Page: [[Focus Mode]], [[Profile]]
- Features: [[Focus Timer]], [[Karma and gamification]], [[Persistence layer]]
