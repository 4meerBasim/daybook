# Task Detail And Focus Show A Mock Task

Status: fixed
Found: `src/screens/TaskDetailScreen.tsx` and `src/screens/FocusScreen.tsx` — neither took a route param, so both rendered one hardcoded task whatever row was long-pressed
Fixed: both screens take a `taskId`, and `useTaskDetail(taskId)` reads the real row and its subtasks

## Details
[[Task Detail]] drew the seeded invoice task and nothing else: `t.task1` as the title, a literal `10:00` for the time, `09:30` for the reminder, a hardcoded `#invoice` chip, `t.noteBody` as the note and `invoice-0918.pdf · 240 KB` as an attachment. [[Focus Mode]] drew `t.task2` with `t.work · t.sub2` under it and a `1 / 4` session counter. Only the subtasks were real, and they came from a store slice loaded for the constant `SEED_INVOICE_TASK_ID`.

Because neither screen took a param, long-pressing any row on [[Today]], [[Upcoming]] or [[Unfiled]] opened the same invoice task. The row's own values were sitting in the table unread.

## Fix
`RootParams` now carries `TaskDetail: { taskId: string }` and `Focus: { taskId: string }`, and every long-press passes the row's id. `selectTask` joins `selectSubtasks` behind a new `useTaskDetail(taskId)` hook in the store, which re-reads whenever the store's `revision` counter advances — the counter is bumped at the end of every `reload`, so any write refreshes the open screen without the detail having to live in the global snapshot. That also removed the `subtasks` slice, which existed only to serve this one screen.

The title checkbox was a bare `View` and is now a real `Pressable` that toggles `completedAt`, with the title striking through when it does. Fields render their stored value or an explicit empty state — `No date`, `No reminder` — and the priority, tags, subtask and note blocks are omitted when the row has none, rather than drawing a field with mock contents. Tag chips take their tint from `tagColors`, the same hash the rest of the app uses.

The attachment row is gone. Nothing backs attachments, so on a screen that now shows real data a fixed `invoice-0918.pdf` would be the only lie left on it. [[Voice Brain Dump Capture]] is the enhancement that gives attachments a backing, and the row returns with it.

[[Focus Mode]] shows the real title, with the project name and the first unfinished subtask as its subtitle when they exist. The `1 / 4` counter is gone — nothing counts sessions.

## Related
- Page: [[Task Detail]], [[Focus Mode]], [[Today]], [[Upcoming]], [[Unfiled]]
- Features: [[Offline First Local Store]], [[Focus Timer]], [[Ink Strike-Through Completion]]
- Bugs: [[Task And Subtask Ids Share One Done Map]], [[Focus Mode Unreachable]]
- Enhancements: [[Day Capacity Budget]], [[Adaptive Reminders]], [[Waiting On Follow-Ups]], [[Notes With Live Task Lines]], [[Voice Brain Dump Capture]]
