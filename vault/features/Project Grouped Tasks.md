# Project Grouped Tasks

Status: shipped
Summary: Every task belongs to a project or to none, the Today and Inbox tabs show one row per project instead of the tasks themselves, and tapping a project opens its tasks for that list.

## Details
The data is one list. `tasks(t, ar)` in `src/data/seed.ts` returns every task with a `list` (`today` | `inbox`), a `projectId` (or `null`) and a `meta` string for its time or day; `projects(t)` returns the three projects — Studio (blue), Work (ochre) and Home (moss). The separate `upcoming()`, `inbox()` and `project()` seeds are gone, and with them the task's own `color` and `time` fields: colour now belongs to the project. A task can also carry a description, a priority and a status — see [[Task Details]].

`src/state/store.tsx` adds an `added` array and `addTask`, which appends a task under a generated id (`a1`, `a2`, …), and a `useTasks()` hook that returns seed plus added tasks minus anything in `cleared`. Every screen that counts or lists tasks reads from that hook, so a task captured in [[Quick Add Sheet]] shows up everywhere at once. Added tasks live in memory only.

`src/components/ProjectRows.tsx` is what [[Today]] and [[Inbox]] render in place of task rows. It takes a `list`, the page's search `query` and an `onOpen` callback, and draws one 56pt ruled row per project that has at least one task in that list: the project's colour dot in the checkbox column, its name, a monospace done/total count, and a chevron that flips in Arabic. Tasks with no project collect under a final "No project" row with an `ink3` dot. Projects with nothing in the list are not drawn, and the row is a single button labelled with the name and count for screen readers.

The query narrows the rows through [[Inline Page Search]]: a project stays if its name matches or if any task title inside it matches. With a query and no surviving rows the component renders the "no matches" label; with no query and no tasks it renders nothing.

Tapping a row pushes the `Project` stack route with `{ projectId, list }` — `MainTabs` in `src/navigation/Root.tsx` builds an `openProject(list)` callback per tab. [[Project Detail]] then shows that project's tasks for that list as live rows, with [[Swipe Row Actions]] and [[Ink Strike-Through Completion]], and its header count and the count on the project row both read the same `done` map, so striking a task there is reflected on the tab when the user goes back. The Projects row on [[Profile]] opens Studio with no `list`, which shows the project's tasks across both lists.

Seeded distribution: Today holds Studio 4, Work 2, Home 3 and one unassigned; Inbox holds Home 1 and two unassigned. There is no `upcoming` list any more — the five seed tasks dated tomorrow or later sit on `today`, keep their day in `meta` and carry `later: true`. The flag keeps them out of [[Today]]'s remaining count and wax stamp and out of [[Profile]]'s done-today count; `ProjectRows` and [[Project Detail]] ignore it, so they still show in their project and in its done/total count.

[[Recent]] is the exception to the grouping: it does not use `ProjectRows` but lists every task from `useTasks()` directly, newest first, and shows the project only as each row's meta text and colour dot ("No project" with an `ink3` dot when unassigned).

## Related
- Page: [[Today]], [[Recent]], [[Inbox]], [[Project Detail]], [[Profile]], [[Main Tabs]], [[Quick Add Sheet]]
- Features: [[Task Details]], [[Add Task Inside Project]], [[Inline Page Search]], [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Inbox Triage Chips]]
