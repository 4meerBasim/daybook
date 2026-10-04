# Phase 1 id counters collide after soft-delete

Status: fixed
Found: src/state/store.tsx:121-123
Summary: Phase 1 task/project/habit id counters seed from the surviving-row count, so a newly generated id can collide with an existing row after a soft-delete and restart.

## Details
`taskSeq`, `projectSeq` and `habitSeq` are seeded from `initial.added.length` / `initial.addedProjects.length` / `initial.addedHabits.length` — a COUNT of surviving (non-deleted) rows. After a soft-delete plus restart that count shrinks, so the next generated id (`t{n}` / `p{n}` / `h{n}`) can collide with an id still held by a live row. The Phase 2 counters (`journalSeq`, `entrySeq`, `templateSeq`) were fixed to seed from the maximum existing id via `maxIdSeq(...)`; Phase 1 was intentionally left out of scope.

Fixed: `taskSeq`/`projectSeq`/`habitSeq` originally re-seeded from `maxIdSeq(ids, prefix)` over the existing ids in `src/state/store.tsx` instead of the surviving-row count, so a restored id could no longer be reissued. This whole class of bug is now structurally impossible: the sequential per-device id scheme (and `maxIdSeq` with it) was removed when all user-created entities moved to UUIDs (`src/lib/id.ts` `newId()` → expo-crypto `randomUUID`, migrated by the `user_version = 2` SQLite migration in `src/lib/db.ts`). A freshly minted UUID can never collide with a live or soft-deleted row. See [[Persistence layer]] and [[Cloud sync (Supabase)]].

## Related
- Feature: [[Persistence layer]], [[Cloud sync (Supabase)]]
