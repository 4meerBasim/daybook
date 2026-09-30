# Task Details

Status: shipped
Summary: A task carries a description, a priority and a status as well as its title, entered when it is added from the quick-add sheet and shown on its own detail page and on its project row.

## Details
`Task` in `src/data/seed.ts` gained three optional fields:

| Field | Type | Values |
|---|---|---|
| `desc` | `string` | free text |
| `priority` | `Priority` | `none`, `low`, `medium`, `high` |
| `status` | `Status` | `todo`, `doing`, `waiting` |

All three are optional, so a task without them reads as no description, priority `none` and status `todo`. Completion is not a status value — it is still the `done` map in `src/state/store.tsx`, keyed by task id, the same one [[Ink Strike-Through Completion]] draws from. Two seed tasks carry the new fields: `t1` has a description, `high` and `doing`; `t4` has `medium`.

Where they are entered: [[Quick Add Sheet]]. Under the parsed chips are two labelled fields drawn by a local `DetailInput` component — WHEN, a single line whose text is parsed like the title and otherwise kept as typed in the task's `meta` (see [[Natural Language Quick Add]]), and DESCRIPTION, multiline, which now shows its label above the field instead of carrying it only for screen readers — then three radio chip groups — Priority, Status and Project — drawn by a local `ChoiceChips` component. Status starts on "To do". Priority starts on "None" but follows the title until the user picks one: while the line contains a priority word (`!`, `!!`, مهم — the `pri` kind of [[Natural Language Quick Add]]) the High chip is selected, and a chip the user taps overrides that for the rest of the sheet's life. `submit` passes the trimmed description, the priority and the status to `addTask` along with the title, `meta`, list and project. The state is local to the sheet, so every opening starts blank. The inline row of [[Add Task Inside Project]] does not collect any of this — it still creates a title-only task.

Where they are shown:

- [[Task Detail]] takes a `taskId` route param and shows that task: its project in the header, a checkbox and the title, then When, Priority and Status rows and a Description block. Priority is a chip coloured from `priorityColors`, or an outlined "None"; Status is an outlined chip that reads "Done" once the task is checked, whatever its stored status; an empty description reads "None" in `ink3`.
- [[Project Detail]] puts a priority-coloured dot before each row's meta when the priority is not `none`, and prefixes the meta with the status when it is not `todo`, as in "In progress · 10:00".
- [[Recent]] opens the detail page for the row that was long-pressed but does not show priority or status itself; its dot and meta are still the project.

`priorityColors` in `src/theme/tokens.ts` maps each priority onto palette keys — low to `blue` / `blueS`, medium to `och` / `ochS`, high to `ver` / `verS` — so the dot and chip recolour with [[Light and Dark Paper Palettes]]. The labels are `none`, `low`, `medium`, `high`, `todo`, `doing`, `waiting`, `status`, `description`, `descPlaceholder` and `whenPlaceholder` in `src/i18n/strings.ts`, in both languages.

Nothing edits these fields after the task is created: the detail page is read-only apart from the checkbox.

Details settled after review: the parsed "High priority" chip is no longer drawn in the sheet, since the Priority group shows the effective value; the sheet takes the top safe-area inset so its taller body cannot slide under the status bar; dismissing the sheet clears the title draft along with the rest; a project row spells the priority out in its meta beside the coloured dot and drops the status once the task is checked; and Task Detail leaves its header label empty when the task id matches nothing.

## Related
- Page: [[Task Detail]], [[Quick Add Sheet]], [[Project Detail]], [[Recent]]
- Features: [[Natural Language Quick Add]], [[Add Task Inside Project]], [[Project Grouped Tasks]], [[Ink Strike-Through Completion]], [[Light and Dark Paper Palettes]]
- Bugs: none
