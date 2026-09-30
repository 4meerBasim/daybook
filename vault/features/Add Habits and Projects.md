# Add Habits and Projects

Status: shipped
Summary: The add sheet opens with a Task / Habit / Project switch, so a new habit or a new coloured project can be created from the same place as a task, and Today and Inbox end their lists with "New habit" and "New project" rows that open the sheet in that mode.

## Details
`src/screens/QuickAddSheet.tsx` exports `AddKind` (`'task' | 'habit' | 'project'`) and takes an `initialKind` prop, default `'task'`. The first thing in the sheet is a three-segment `radiogroup` — Task, Habit, Project (`t.kindTask` / `t.kindHabit` / `t.kindProject`) — 44pt tall in a ruled, rounded frame, the selected segment filled ink with paper text. The kind is local state seeded from `initialKind`, so the user can switch after the sheet is open whichever way it was opened.

- Task — the task form: the highlighted line, parsed chips, labelled When and Description fields, Priority, Status and Project chips. See [[Natural Language Quick Add]] and [[Task Details]].
- Habit — a name field with the "Name the habit…" placeholder, and under it a labelled "TIME (MINUTES)" field (`t.habitTime`, placeholder "e.g. 30") drawn by the sheet's local `DetailInput`, with a number-pad keyboard. Arabic-Indic digits are converted to ASCII as they are typed and anything that is not a digit is dropped.
- Project — the same name field with "Name the project…", and under it a COLOUR `radiogroup` of four swatches: blue, ochre, green and red (palette keys `blue`, `och`, `moss`, `ver`), each a 16pt dot in a 44pt target, the chosen one ringed in ink. Blue is the default.

The name field is shared between the habit and project modes, so text typed in one is kept when switching to the other. The submit button spans the sheet, 48pt tall and filled ink, and is labelled for the kind: "Add task", "Add habit" or "Add project". It and the name field's submit key both call `submit`. For a habit or project the name is trimmed; an empty name keeps the sheet open, otherwise `addHabit(name, minutes)` or `addProject({ name, color })` is called and the sheet closes. The minutes are `Math.min(Number(minutes) || 0, 1440)` from a field capped at four digits that accepts Arabic and Persian digits, so an empty field is stored as 0, which means no target. In habit mode the name field's return key moves to the minutes field instead of submitting.

`src/state/store.tsx` holds the new records beside `added`:

- `addedProjects` and `addProject`, which appends a project under a generated id (`p1`, `p2`, …).
- `addedHabits` and `addHabit`, which takes `(name, minutes)` and appends `{ id, name, streak: 0, minutes }` under `g1`, `g2`, …. `Habit` is `{ id, name, streak, minutes }`, where `minutes` is the session target and 0 means none.
- `useProjects()` returns the three seed projects followed by the added ones; `useHabits()` returns the seeded habit (`h1`, `t.habit1`, streak 12, 30 minutes) followed by the added ones.
- `HabitSession` gained a `habitId`, so sessions belong to one habit — see [[Habit Session Timer]].

All of it is plain `useState`: in memory only and gone on restart, like added tasks. Every screen that used to call `projects(t)` from the seed — `ProjectRows`, [[Project Detail]], [[Recent]], [[Task Detail]] and the sheet's own Project chips — now reads `useProjects()`, so a new project appears in all of them at once and can be picked for a task straight away.

The two entry rows are drawn by `AddRow` in `src/components/Ledger.tsx`: a 56pt ruled row with a plus icon (`PlusIcon`, new in `src/components/Icon.tsx`) in the checkbox column and an `ink3` label, greying to `paper2` while pressed.

- "New project" is the last row of `ProjectRows`, so it appears on both [[Today]] and [[Inbox]], and opens the sheet in project mode.
- "New habit" is the last row of the habits section on [[Today]] and opens the sheet in habit mode.

Both are hidden while the page's search field has text. `MainTabs` in `src/navigation/Root.tsx` keeps the sheet's state as `AddKind | null` rather than a boolean: the pen FAB sets `'task'`, the rows set `'project'` or `'habit'`, and the value is passed as `initialKind`. [[Project Detail]] mounts the sheet without `initialKind`, so it opens on Task there, with the switch still available.

A new project is listed on Today and Inbox even before it has tasks — see [[Project Grouped Tasks]]. A new habit gets its own row on Today and its own timer page — see [[Habit]]. A target above zero shows on both: "30 min" on the Today row and "TARGET · 30 min" under the clock on the Habit page — see [[Habit Session Timer]]. The new strings have Arabic counterparts in `src/i18n/strings.ts`, and the switch and swatch rows follow the reading direction.

Details settled after review: submitting an empty name or title keeps the sheet open instead of closing it as if something was added; the name field is labelled "New habit" or "New project" for screen readers and is not remounted when switching between those two kinds; the kind switch is a labelled radio group; a project with no tasks in the list shows no count rather than 0/0, and "No project" appears only when it holds tasks; the wax stamp on Today is pressable only on the stamp itself, so it no longer covers the rows beside it; and the four unused tool icons were deleted from `src/components/Icon.tsx`.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Inbox]], [[Habit]], [[Main Tabs]]
- Features: [[Natural Language Quick Add]], [[Project Grouped Tasks]], [[Habit Session Timer]]
- Bugs: [[Quick Add Does Not Create Tasks]] — fixed; its leftover decorative tool icons were removed here
