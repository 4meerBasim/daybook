# Task And Subtask Ids Share One Done Map

Status: fixed
Found: `src/state/store.tsx:17`, consumed by `TodayScreen.tsx:34` and `TaskDetailScreen.tsx:204`
Summary: One global `done` record held completion for both [[Today]] task rows and [[Task Detail]] subtasks, in a single unnamespaced id space where a task id and a subtask id could collide.

## Details
`done: Record<string, boolean>` on the store was keyed by whatever string the caller passed. [[Today]] passed task ids `t1`–`t5` from the old seed array; [[Task Detail]] passed subtask ids `d1`–`d3` declared inline in the screen. Nothing separated the two namespaces, nothing generated either set, and nothing stopped a future id from landing on both — a subtask keyed `t2` would have toggled a task, and vice versa.

The subtask side was worse than shared: because the map started empty but `sub1` had to render checked, the screen inverted its own lookup per row —

```
const checked = s.checked ? !done[s.id] : !!done[s.id];
```

so the initial state lived in the literal array and the map only recorded deviations from it. The `1 / 3` tally beside the SUBTASKS label was a hardcoded string that never moved when a row was toggled.

Fixed by removing the map entirely. Completion is now a timestamp on the row it belongs to — `tasks.completedAt` and `subtasks.completedAt` — in two tables with two separate id spaces, seeded as `seed-invoice` and `seed-invoice-sub-1..3`. A subtask is reached only through `parentTaskId`, so there is no shared keyspace left to collide in. `complete(id, done)` and `completeSubtask(id, done)` are separate store actions writing separate tables, and the tally is derived from the rows.

This also means subtask state persists, which it never did before. Verified on web: toggling the second subtask moved the tally to `2 / 3`, and it was still `2 / 3` after a page reload and a dev-server restart.

## Related
- Feature: [[Offline First Local Store]], [[Ink Strike-Through Completion]]
- Page: [[Task Detail]], [[Today]]
- Bugs: [[Snooze And Delete Share One Cleared Map]]
- Enhancements: [[Notes With Live Task Lines]]
