# Add Task Inside Project

Status: shipped
Summary: A project page can take new tasks directly, either by typing into a blank row under the last task or by tapping a pen button that opens the quick-add sheet already set to this project.

## Details
`src/screens/ProjectScreen.tsx`. Both entry points file the task under the page's own `projectId` and the list being viewed, `list ?? 'today'` — so on the [[Profile]] entry, which passes no `list`, new tasks go to Today.

The inline row sits directly after the last task inside the ledger, at the same `metrics.row` height and with the same bottom rule. In the checkbox column it draws an empty box with a 1.5pt dashed `ink3` outline, and beside it a `TextInput` with the "Write a task…" placeholder, announced to screen readers by that placeholder. Submitting from the keyboard runs `addDraft`: the text is trimmed, an empty line does nothing, otherwise `addTask({ title, meta: '', list, projectId })` adds a plain task and the field is cleared. `submitBehavior="submit"` keeps the keyboard up, so several tasks can be entered in a row. Nothing is parsed here — dates, times and tags typed into the row stay in the title and the task has no `meta`. It is also title-only: no description, priority or status is set, so the task reads as None / To do on [[Task Detail]] and its row shows no priority dot — those fields are collected only by the sheet, see [[Task Details]]. The `ScrollView` takes `keyboardShouldPersistTaps="handled"` and `automaticallyAdjustKeyboardInsets` so the row stays reachable while typing.

The pen is a round 56pt `Pressable` filled with `c.ink`, pinned bottom-centre 32pt above the screen edge (not rendered while the inline field has focus or the sheet is open, so it never sits over the text being typed) in an absolutely positioned `box-none` wrapper, reusing `metrics.pen`, `radius.pen`, `penShadow` and `PenIcon` from [[Pen FAB Tab Bar]]. It fires a medium haptic and sets a local `adding` flag, which mounts [[Quick Add Sheet]] with `initialProjectId={projectId}` and `undatedList={list ?? 'today'}`. The sheet opens with this project's chip selected, and a task with no date lands in the list being viewed instead of Inbox; a dated one still goes to Today, as in [[Natural Language Quick Add]]. The scroll content's bottom padding is raised to clear the button.

Either way the task goes through the same `addTask` as everywhere else, so it appears on this page at once, raises the header count, and shows under the project's row on the tab — see [[Project Grouped Tasks]].

After each inline add the scroll view moves down by one row so the field stays above the keyboard, and submitting an empty field dismisses the keyboard.

## Related
- Page: [[Project Detail]], [[Quick Add Sheet]], [[Task Detail]]
- Features: [[Task Details]], [[Project Grouped Tasks]], [[Natural Language Quick Add]], [[Pen FAB Tab Bar]]
- Bugs: none
