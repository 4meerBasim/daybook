# Task Detail

Route: `TaskDetail` (native stack), params `{ taskId: string }`
Summary: One task opened up — its project, a checkbox and the title, then When, Priority and Status rows and the description.

## Related
- Connects to: [[Project Detail]], [[Recent]] — reached by long-pressing a task row on either, which passes that row's id; the back chevron calls `navigation.goBack()`, [[Focus Mode]] — the ellipsis button in the header, [[Main Tabs]]
- Features: [[Task Details]], [[Add Task Inside Project]], [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: none

## Notes
`src/screens/TaskDetailScreen.tsx`. The screen takes `taskId` from the route, finds the task in `useTasks()` and its project in `projects()`. The header holds the back chevron, the project name ("No project" when the task has none) and the ellipsis button, which still opens [[Focus Mode]]. If no task matches the id — one that was snoozed or deleted, say — only the header is drawn.

Below the header the checkbox and title are one pressable with the `checkbox` role. Tapping it toggles the task in the `done` map in `src/state/store.tsx`, the same entry its row on [[Project Detail]] and [[Recent]] reads, with a medium haptic on completion only. A checked title greys to `ink3` with a plain line-through rather than the animated stroke.

Then three label rows drawn by a local `Field` component, each `metrics.row` high with the label in the `metrics.labelColumn` column, and a description block:

- When — the task's `meta`, or the name of its list (Today / Inbox) when it has none; vermilion while the task is overdue and unchecked.
- Priority — a chip coloured from `priorityColors`, or an outlined "None".
- Status — an outlined chip with the stored status ("To do" when unset), replaced by "Done" while the task is checked.
- Description — the task's `desc`, or "None" in `ink3`.

See [[Task Details]] for the fields themselves. The page is read-only apart from the checkbox.

This replaced a single fixed mock. The route used to take no params, so every row opened the same Studio task; the repeat hint, the reminder row, the `#invoice` tag chip, the three checkable subtasks with their `1 / 3` count, the note and the attachment tile are gone, along with the `weekly`, `reminder`, `snoozeHint`, `subtasks`, `sub1`, `sub3`, `notes` and `attachHint` strings. The old note text survives as the description of seed task `t1`. The red margin line that ran beside the subtasks went with them.
