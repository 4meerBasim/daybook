# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` mounted by `MainTabs` or by `ProjectScreen`, each only while its own `adding` flag is true
Summary: The add sheet: a Task / Habit / Project switch on top, then either the task form — one line of input that is syntax-highlighted live, parsed chips and a destination hint, labelled When and Description fields, Priority, Status and Project chip groups — or a name field for a habit or project, with a labelled time-in-minutes field for a habit and a colour picker for a project, and a full-width button that adds it.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by the add button, keyboard submit, pan-down or backdrop tap, [[Project Detail]] — opened by that page's own pen button with the project preselected, [[Today]] — also opened in project mode by its "New project" row and in habit mode by its "New habit" row, [[Inbox]] — also opened in project mode by its "New project" row, [[Recent]], [[Profile]]
- Features: [[Add Habits and Projects]], [[Natural Language Quick Add]], [[Task Details]], [[Project Grouped Tasks]], [[Add Task Inside Project]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Sheet Shown On Launch]]
- Enhancements: none

## Notes
`src/screens/QuickAddSheet.tsx`. The component takes `onClose` and three optional props, `initialKind` (default `'task'`), `initialProjectId` (default `null`) and `undatedList` (default `'inbox'`). `MainTabs` passes only `initialKind`; [[Project Detail]] passes its own project and the list being viewed and leaves the kind at Task — see [[Add Task Inside Project]].

The sheet opens with a three-segment switch — Task, Habit, Project — a `radiogroup` whose selected segment is filled ink. It starts on `initialKind` (exported as the `AddKind` type) and can be changed once the sheet is open. Habit and Project replace the task form with a single name field ("Name the habit…" / "Name the project…"); Habit adds a "TIME (MINUTES)" field on a number pad with the "e.g. 30" placeholder, and Project adds a COLOUR row of four swatches, blue, ochre, green and red, with blue selected. Submitting calls `addHabit(name, minutes)` or `addProject` with the trimmed name and closes the sheet; an empty time is stored as 0, meaning no target. See [[Add Habits and Projects]]. Everything below describes Task mode.

Every detail field is drawn by a local `DetailInput` component: a small uppercase monospace label in `ink3` over a `BottomSheetTextInput` with a bottom rule, 44 to 82pt tall, the label doubling as the accessibility label. It is used for the habit time and for the task's When and Description fields.

The visible text is a transparent `BottomSheetTextInput` sitting on top of an absolutely positioned coloured `Text` built from the parser's tokens, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Today" or "Saved to Inbox" — a date understood in the title or in the When field, or any unrecognised text in the When field, goes to Today, otherwise Inbox — which is why this sheet points at [[Today]] and [[Inbox]]. The no-date destination is really `undatedList`: opened from a project page viewed under Today, an undated task is filed on Today and the chip says so. Whichever list it is filed under, the new task also shows at the top of [[Recent]].

Below the parsed chips are two labelled `DetailInput` fields. WHEN is a single line with the "e.g. tomorrow 3pm" placeholder; its text goes through the same `parse` as the title, and its chips are drawn in the chip row after the title's. If nothing in it is recognised, the trimmed text is kept as typed (`freeWhen`). DESCRIPTION is multiline with the "Add a description…" placeholder. Then come three labelled `radiogroup`s of chips drawn by a local `ChoiceChips` component — see [[Task Details]]:

- Priority — None, Low, Medium, High. It follows the title until the user picks one: High is selected while the title or the When field contains a priority word (`!`, مهم), None otherwise, and a tapped chip then stays.
- Status — To do (the default), In progress, Waiting.
- Project — "No project" first, then every project from `useProjects()`: Studio, Work and Home, followed by any the user has added.

All of it is local state, so it resets each time the sheet opens; the project is seeded from `initialProjectId` — "No project" from the tab bar, the page's project from [[Project Detail]]. The sheet body is a `BottomSheetScrollView` with `keyboardShouldPersistTaps="handled"`, so the taller content scrolls inside the sheet and the chips take a tap while the keyboard is up.

The "Add task" button and the title field's submit key both call `submit`: the plain words become the title, the date, time and repeat chips of the title and the When field together become its `meta` (a date chip that reads exactly "Today" is dropped), followed by the unrecognised When text if there is any, a task is flagged `later` when either text names a day other than today (`hasLaterDay`) or the When text was kept verbatim, and `addTask` files it under the chosen list and project with the trimmed description, the priority and the status — see [[Project Grouped Tasks]]. The text is then cleared and the sheet closes. An empty title keeps the sheet open.

The button is the last thing in the sheet in every mode: full width, 48pt, filled ink, labelled "Add task", "Add habit" or "Add project" for the selected kind. The four decorative tool icons that used to sit beside it (calendar, flag, hash, paperclip) have been removed.
