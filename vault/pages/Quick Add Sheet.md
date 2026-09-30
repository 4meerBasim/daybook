# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` rendered inside `MainTabs`, opened by the `adding` flag
Summary: The pen-FAB capture sheet: one line of input that is syntax-highlighted live, parsed chips and a destination hint, a row of project chips, and an Add button that files the task.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by Add, keyboard submit, pan-down or backdrop tap, [[Today]], [[Upcoming]], [[Inbox]], [[Profile]]
- Features: [[Natural Language Quick Add]], [[Project Grouped Tasks]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]]
- Enhancements: none

## Notes
`src/screens/QuickAddSheet.tsx`. The visible text is a transparent `BottomSheetTextInput` sitting on top of an absolutely positioned coloured `Text` built from the parser's tokens, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Today", "Saved to Upcoming" or "Saved to Inbox" from `parsed.isToday` and `parsed.hasDate`, which is why this sheet points at [[Today]], [[Upcoming]] and [[Inbox]].

Below the parsed chips is a `radiogroup` of project chips — "No project" first and selected by default, then Studio, Work and Home from `projects()`. The choice is local state and resets to "No project" each time the sheet opens.

The Add button and the keyboard's submit key both call `submit`: the plain words become the title, the time chip (and the date chip when the task is going to Upcoming) become its `meta`, and `addTask` files it under the chosen list and project — see [[Project Grouped Tasks]]. The text is then cleared and the sheet closes. An empty line just closes the sheet. The four tool icons beside Add (calendar, flag, hash, paperclip) are still decorative.
