# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` mounted by `MainTabs` or by `ProjectScreen`, each only while its own `adding` flag is true
Summary: The pen-button capture sheet: one line of input that is syntax-highlighted live, parsed chips and a destination hint, a row of project chips, and an Add button that files the task.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by Add, keyboard submit, pan-down or backdrop tap, [[Project Detail]] — opened by that page's own pen button with the project preselected, [[Today]], [[Recent]], [[Inbox]], [[Profile]]
- Features: [[Natural Language Quick Add]], [[Project Grouped Tasks]], [[Add Task Inside Project]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Sheet Shown On Launch]]
- Enhancements: none

## Notes
`src/screens/QuickAddSheet.tsx`. The component takes `onClose` and two optional props, `initialProjectId` (default `null`) and `undatedList` (default `'inbox'`). `MainTabs` passes neither; [[Project Detail]] passes its own project and the list being viewed — see [[Add Task Inside Project]]. The visible text is a transparent `BottomSheetTextInput` sitting on top of an absolutely positioned coloured `Text` built from the parser's tokens, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Today" or "Saved to Inbox" from `parsed.hasDate` — any date goes to Today, no date to Inbox — which is why this sheet points at [[Today]] and [[Inbox]]. The no-date destination is really `undatedList`: opened from a project page viewed under Today, an undated task is filed on Today and the chip says so. Whichever list it is filed under, the new task also shows at the top of [[Recent]].

Below the parsed chips is a `radiogroup` of project chips — "No project" first and selected by default, then Studio, Work and Home from `projects()`. The choice is local state seeded from `initialProjectId`, so it resets each time the sheet opens: to "No project" from the tab bar, to the page's project from [[Project Detail]].

The Add button and the keyboard's submit key both call `submit`: the plain words become the title, the date, time and repeat chips become its `meta` (a date chip that reads exactly "Today" is dropped), a task naming a day other than today is flagged `later` from `parsed.hasLaterDay`, and `addTask` files it under the chosen list and project — see [[Project Grouped Tasks]]. The text is then cleared and the sheet closes. An empty line just closes the sheet. The four tool icons beside Add (calendar, flag, hash, paperclip) are still decorative.
