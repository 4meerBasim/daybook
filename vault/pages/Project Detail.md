# Project Detail

Route: `Project` (native stack), params `{ projectId: string | null; list?: 'today' | 'inbox' }`
Summary: One project's tasks for one list — back button, "PROJECT · <LIST>" label, project name, a live done/total count, and the tasks as swipeable, checkable rows, with a blank row and a pen button for adding more.

## Related
- Connects to: [[Today]], [[Inbox]] — reached by tapping a project row on either; the back chevron calls `navigation.goBack()`, [[Profile]] — the Projects row opens Studio across all lists, [[Task Detail]] — long-press a task row, [[Calendar]] — swipe a row past the pick-date threshold, [[Quick Add Sheet]] — the pen button opens it with this project preselected, [[Main Tabs]]
- Features: [[Project Grouped Tasks]], [[Add Task Inside Project]], [[Pen FAB Tab Bar]], [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Inbox Triage Chips]]

## Notes
`src/screens/ProjectScreen.tsx`. The screen reads `projectId` and `list` from the route, looks the project up in `projects()` and filters `useTasks()` to that project and, when `list` is given, that list. A `null` project id is the "No project" bucket: the title reads "No project" and the dot is `ink3`. With no `list` — the [[Profile]] entry — the label is just "PROJECT" and tasks from both lists appear together.

The count is live, done over total for the rows on screen, pinned to `writingDirection: 'ltr'`. Each row is a `SwipeableRow` around a `TaskRow`: tapping the checkbox or swiping to complete toggles the `done` map, snooze and delete both call `clear(id)` and the row leaves the page, pick-date opens [[Calendar]], and a long-press opens [[Task Detail]]. The same four actions are exposed as accessibility actions. These are the rows that used to be on [[Today]], and the Recent tab mounts the same pair for every task across projects; the thresholds are illustrated on [[Swipe States]].

Tasks can be added without leaving the page — see [[Add Task Inside Project]]. Under the last task is a blank row with a dashed checkbox outline and a text field; submitting adds a plain task to this project and the list being viewed, clears the field and keeps the keyboard up. A round pen button pinned bottom-centre, the same look as the one in [[Pen FAB Tab Bar]], opens [[Quick Add Sheet]], mounted by this screen while its own `adding` flag is true, with this project preselected and undated tasks sent to the list being viewed. With no `list` both paths fall back to Today.

This replaced the static Studio mock — the fixed 7/12 count, the shared avatars, the `#design` / `#invoice` chips and the "this week" / "later" sections are gone, along with the `shared`, `thisWeek` and `later` strings. Rows no longer carry a project dot, since the whole page is one project. [[Task Detail]] is still a single fixed screen, so every row opens the same task.
