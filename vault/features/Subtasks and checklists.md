# Subtasks and checklists

Status: shipped
Summary: Break a task into checkable subtasks tracked with a done-count.

## Details
`src/components/SubtaskList.tsx` renders checkable subtasks on [[Task Detail]], backed by a new `subtasks` table in `src/lib/db.ts` and subtask CRUD actions in `src/state/store.tsx`. `src/components/TaskRow.tsx` shows the subtask progress (done over total) on the parent task's row, restoring the checklist the old mock drew.

## Related
- Page: [[Task Detail]]
