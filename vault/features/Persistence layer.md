# Persistence layer

Status: shipped
Summary: Tasks, projects, habits, habit sessions, done/cleared state and user settings are saved to on-device SQLite and restored on launch, so nothing is lost when the app restarts.

## Details
Backed by `expo-sqlite` (async API) through `src/lib/db.ts`, which owns the schema, a version-stepped `initDatabase()` migration, a `loadSnapshot()` reader and per-entity upsert / soft-delete writers.

Schema version: `user_version` gates the migration steps. v1 adds the later task columns; v2 (`migrateIdsToUuid`, run inside a transaction) rewrites every user-created row's id from the old sequential per-device string (`a{n}`, `p{n}`, …) to a UUID and remaps all by-convention foreign references in lock-step. New ids come from `src/lib/id.ts` `newId()` (expo-crypto `randomUUID`); seed/built-in ids stay literal and are skipped. See the "Globally-unique ids" note under [[Cloud sync (Supabase)]] for the full remap list and rationale, and [[Phase 1 id counters collide after soft-delete]].

Tables: `tasks`, `task_tags`, `task_state` (taskId PK + done + cleared, covers seed and added task ids), `projects`, `habits`, `habit_sessions`, `settings`, plus the Phase 2 journaling tables `journals`, `entries` (indexed on `day` and `journalId`) and `entry_templates`, the Phase 4 `subtasks` and `smart_lists` tables, the Phase 5 `attachments` table (indexed on `taskId` and `entryId`) that backs [[Attachments]], and the Phase 6 `focus_sessions` table (id, taskId, startedAt, seconds; indexed on `startedAt`) that backs [[Focus stats]]. Phase 6 also adds the `appLockEnabled` boolean to the generic `settings` KV store (no schema change) for [[Biometric app lock]]. Every entity row carries a stable string `id`, `updatedAt` (epoch ms) and nullable `deletedAt` — the same sync-ready convention across Phase 1 and Phase 2 — and [[Cloud sync (Supabase)]] now rides on exactly this convention — generic `getChangedRows` / `applyRemoteRows` helpers plus `syncEnabled` / `syncOwnerId` / `lastSyncAt` prefs in the settings KV (no schema change), with a store `hydrate()` to re-seed after a pull. The journaling tables back [[Daily note]], [[Multiple journals]] and [[Entry templates]].

`StoreProvider` (`src/state/store.tsx`) and `ThemeProvider` (`src/theme/ThemeProvider.tsx`) hydrate from the snapshot via an `initial` prop and write through to SQLite inside their setters. `App.tsx` gates render on both `fontsLoaded` and the loaded snapshot, mirroring the fonts null-return, so there is no empty-state flash. Seed lists stay in-memory and are not persisted; `qa` and `sel` stay ephemeral.

The schema is tag-ready for [[Persist + filter tags]]: `addTask` persists `Task.tags` into `task_tags` (one row per tag, `/`-safe for [[Nested tags]]) and hydration restores them; nothing populates tags yet.

## Related
- Page: [[Today]], [[Inbox]], [[Habit]], [[Settings]], [[Focus Mode]]
- Features: [[Daily note]], [[Multiple journals]], [[Entry templates]], [[Attachments]], [[Focus stats]], [[Biometric app lock]], [[Export JSON and Markdown]], [[Cloud sync (Supabase)]], [[Home-screen widget]]
- Bugs: [[Phase 1 id counters collide after soft-delete]]
- Enhancements: [[Persist + filter tags]]
