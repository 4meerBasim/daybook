# Cloud sync (Supabase)

Status: shipped
Summary: Opt-in bidirectional cloud sync to a Supabase backend, built on the existing `updatedAt` / `deletedAt` columns, that no-ops cleanly whenever it is not configured, disabled, or offline.

## Details
Enabled from [[Settings]] under a "Cloud sync" group; tied to a per-device anonymous owner id.

Client (`src/lib/supabase.ts`): creates the `@supabase/supabase-js` (v2.117) client ONLY when both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are present (read via `process.env`; Expo inlines `EXPO_PUBLIC_*` at build), otherwise exports `null`. `isSyncConfigured()` reports whether it exists. Auth session storage is intentionally not wired (`persistSession`/`autoRefreshToken`/`detectSessionInUrl` all `false`) to keep it lean. `react-native-url-polyfill/auto` is imported because supabase-js needs a WHATWG `URL` on React Native. `newOwnerId()` generates a uuid stand-in; `newShareCode()` backs [[Real-time shared lists (Supabase)]].

Engine (`src/lib/sync.ts`): `syncNow()` iterates `SYNC_TABLES` (tasks, projects, entries, journals, habits, subtasks, smart_lists, focus_sessions, attachments). It pushes local rows with `updatedAt > lastSync` (mapping `updatedAt`→`updated_at`, `deletedAt`→`deleted_at`, adding `owner`) via `upsert(onConflict: 'id')`, then pulls remote rows for this owner changed since last sync and applies them locally newer-wins. It returns early (never throws) when supabase is `null`, the pref is off, or the owner id is missing, and catches every error into a result object. `task_tags`, `task_state`, `habit_sessions` and `entry_templates` are not yet synced (documented limitation).

Local DB (`src/lib/db.ts`): two generic helpers added — `getChangedRows(table, since)` and `applyRemoteRows(table, rows)` (quotes every identifier so reserved columns like `over`/`desc` are safe; `ON CONFLICT(id) ... WHERE excluded.updatedAt > table.updatedAt`). No local schema change: the `updatedAt`/`deletedAt` convention that every table already carries (see [[Persistence layer]]) is exactly what sync rides on. Three new prefs live in the settings KV via the `JournalPrefs` pattern — `syncEnabled`, `syncOwnerId` (generated once), `lastSyncAt`.

Store (`src/state/store.tsx`): `syncEnabled`/`setSyncEnabled`, `ensureOwnerId()`, `lastSyncAt`/`setLastSyncAt`, and a new `hydrate(snapshot)` that re-seeds every state slice and id-sequence ref — used to refresh the store after a pull.

Setup (`supabase/schema.sql`, `.env.example`): a documentation-only SQL file creates the synced tables plus the shared-list tables, each with `owner uuid` / `updated_at` / `deleted_at`, enables Row Level Security with owner-scoped policies, and adds `tasks` to the realtime publication. Owner scoping uses an anonymous on-device uuid as a stand-in; true multi-device/multi-user sync needs real Supabase Auth so `auth.uid()` matches the owner id. Not runtime-tested against a live project.

Known limitation — entity ids are not globally unique (follow-up before production multi-device sync). Added rows get sequential per-device ids (`a{n}`, `p{n}`, …) from `src/state/store.tsx`. Two devices creating rows offline can mint the same id, and the newer-wins `ON CONFLICT(id)` upsert in `applyRemoteRows` would then let one device's row overwrite a genuinely different row on another (same risk applies to pulled ids colliding in `joinSharedList`). This is inherent to the id scheme rather than the sync code; before enabling real cross-device sync, synced entities need globally-unique ids (uuid, or an owner-prefixed id) with their child references (`taskId`/`entryId`/`journalId`/`projectId`) remapped accordingly. The scheme was left unchanged here because rewriting core id generation is runtime logic that typecheck cannot verify and risks breaking the shipped local app (task creation, `ensureTask` seed-promotion, subtask/attachment references).

## Related
- Page: [[Settings]], [[Profile]]
- Features: [[Persistence layer]], [[Real-time shared lists (Supabase)]], [[Export JSON and Markdown]]
