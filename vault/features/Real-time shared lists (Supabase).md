# Real-time shared lists (Supabase)

Status: shipped
Summary: Share a project's task list by code and have members' edits merge in live over Supabase realtime — gated entirely behind cloud sync being configured.

## Details
Built on [[Cloud sync (Supabase)]]; shared from [[Project Detail]] and joined from [[Settings]].

Client (`src/lib/shared.ts`):
- `shareProject(projectId, ownerId)` — generates a `share_code` and upserts `shared_projects` (one per project) plus a `project_members` row for the owner; `getShareCode(projectId)` reads an existing code.
- `joinSharedList(code, ownerId, onApplied)` — looks the code up, inserts a `project_members` row, pulls the shared project and its tasks into the local DB via `applyRemoteRows`, then calls `onApplied` to re-hydrate the store.
- `subscribeSharedProject(projectId, onChange)` — opens a Supabase realtime channel on `postgres_changes` for `tasks` filtered to that project and returns an unsubscribe fn.
Every function returns `null`/no-ops when sync is unconfigured and is wrapped in try/catch.

UI:
- [[Project Detail]] shows a "Share list" action in the header for real projects. When sync is unconfigured it alerts `syncRequiredToShare`; otherwise it creates/shows the share code in an alert. A `useEffect` subscribes to realtime for that project (only if it already has a share code) and re-hydrates the store on remote changes.
- [[Settings]] "Cloud sync" group has a "Join a shared list" row that reveals an inline share-code field; submitting joins and merges the project.

Backend (`supabase/schema.sql`): `shared_projects` (project_id PK, owner, unique `share_code`) and `project_members` (project_id + member PK). RLS lets the owner manage the share and lets members read/write the shared project's tasks via an `is_project_member()` check on the `tasks` policy; `tasks` is added to the realtime publication.

The `ownerId` passed to `shareProject` / `joinSharedList` is now the signed-in `auth.uid()` (`ensureOwnerId()`), so `owner` / `member` rows and the `is_project_member()` RLS check line up with a real account — see [[Account sign-in (Google and Apple)]]. Untested against a live backend — there are no real credentials in this build. Implemented correct-by-construction with every path guarded for the unconfigured case; true sharing requires the providers enabled and `supabase/schema.sql` run.

## Related
- Page: [[Project Detail]], [[Settings]]
- Features: [[Cloud sync (Supabase)]], [[Account sign-in (Google and Apple)]], [[Persistence layer]], [[Project Grouped Tasks]]
