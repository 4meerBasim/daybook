# Phase 1 id counters collide after soft-delete

Status: fixed
Found: src/state/store.tsx:121-123
Summary: Phase 1 task/project/habit id counters seed from the surviving-row count, so a newly generated id can collide with an existing row after a soft-delete and restart.

## Details
`taskSeq`, `projectSeq` and `habitSeq` are seeded from `initial.added.length` / `initial.addedProjects.length` / `initial.addedHabits.length` — a COUNT of surviving (non-deleted) rows. After a soft-delete plus restart that count shrinks, so the next generated id (`t{n}` / `p{n}` / `h{n}`) can collide with an id still held by a live row. The Phase 2 counters (`journalSeq`, `entrySeq`, `templateSeq`) were fixed to seed from the maximum existing id via `maxIdSeq(...)`; Phase 1 was intentionally left out of scope.

Fixed: `taskSeq`/`projectSeq`/`habitSeq` now seed from `maxIdSeq(ids, prefix)` over the existing ids in `src/state/store.tsx` instead of the surviving-row count, so a restored id can no longer be reissued.

## Related
- Feature: [[Persistence layer]]
