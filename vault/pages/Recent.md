# Recent

Route: `Main` → tab key `recent`
Summary: A flat list of every task, most recently added first, each row showing its project — the one tab that lists tasks directly rather than project rows.

## Related
- Connects to: [[Main Tabs]], [[Task Detail]] — long-press a task row, [[Calendar]] — swipe a row past the pick-date threshold, [[Quick Add Sheet]] — pen FAB
- Features: [[Swipe Row Actions]], [[Task Details]], [[Ink Strike-Through Completion]], [[Inline Page Search]], [[Project Grouped Tasks]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: none

## Notes
`src/screens/RecentScreen.tsx`, renamed from `UpcomingScreen.tsx`. This tab replaced Upcoming: the tab key is `recent`, the icon is a clock, and the label is "Recent" / "الأحدث". It takes `useTasks().reverse()`, so tasks from both lists appear together with the newest addition first — a task filed from [[Quick Add Sheet]] is the top row — followed by the seed tasks in reverse seed order.

Each row is a `SwipeableRow` around a `TaskRow`, the same pair as on [[Project Detail]]. The row's meta is the project name and its dot the project colour, or "No project" with an `ink3` dot when the task is unassigned; the task's own day or time `meta`, its priority and its status are not shown here. An overdue task keeps its overdue styling, and the row's accessibility label reads the title followed by the project name. Tapping the checkbox or swiping to complete toggles the `done` map, snooze and delete both call `clear(id)` and the row leaves the page, pick-date opens [[Calendar]], and a long-press opens [[Task Detail]] for that task — `onOpenTask` now takes the row's id and `MainTabs` passes it on as the `taskId` route param; see [[Task Details]]. The same four actions are exposed as accessibility actions.

The bottom search field filters the rows by task title or project name and shows a "no matches" label when nothing is left — see [[Inline Page Search]]. The header carries no trailing count, and four empty rules close the page.

There is no longer an `upcoming` list behind this tab. `ListKey` is `'today' | 'inbox'`, and tasks with a later day are filed on [[Today]]'s list with the day kept in `meta` and a `later` flag that keeps them out of Today's remaining count — see [[Project Grouped Tasks]]. The tab also has no long-press shortcut; the one that used to open [[Calendar]] was removed.
