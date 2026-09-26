# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` rendered inside `MainTabs`, opened by the `adding` flag
Summary: The pen-FAB capture sheet: a growing field that is syntax-highlighted live, with parsed chips and a destination hint underneath.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by pan-down or backdrop tap, [[Today]], [[Upcoming]], [[Inbox]], [[Search]]
- Features: [[Natural Language Quick Add]], [[Offline First Local Store]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Bottom Sheet Text Input Crashes On Web]], [[Quick Add Highlight Drifts From The Caret]]
- Enhancements: [[Day Capacity Budget]], [[Voice Brain Dump Capture]], [[System Capture Entry Points]]

## Notes
`src/screens/QuickAddSheet.tsx`. The visible text is a coloured `Text` built from the parser's tokens with a transparent `BottomSheetTextInput` laid over it, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Upcoming" or "Saved to Inbox" from `parsed.hasDate`, which is why this sheet points at both [[Upcoming]] and [[Inbox]].

The field is multiline and grows. The mirror is the layer in normal flow and the input is the one absolutely filled over it, which is the opposite of how it started: with the input in flow and single-line it scrolled sideways past the field width and left the caret behind the highlight — [[Quick Add Highlight Drifts From The Caret]]. With the mirror driving the height the input's box always equals its own content, so `scrollEnabled={false}` costs nothing and neither axis can move.

The chips are the shared `Chip` now, so they pick up the Arabic padding widening from [[In-App RTL and Arabic Typography]] like every other chip.

Add now commits. `onAdd` runs `draft()` from `src/lib/parse.ts` over the same parse output the highlighting uses, inserts the task through the store, clears the draft and closes the sheet — see [[Quick Add Does Not Create Tasks]] for what it resolves and what it deliberately leaves in the title. The destination the chip promises is honoured exactly: a due date is written only when `hasDate` is true, so a bare time with no day goes to [[Inbox]] as drawn.

The draft starts empty rather than pre-filled, and only Add clears it — a sheet dismissed by pan-down or backdrop tap keeps what was typed.

The four tool buttons (calendar, flag, hash, paperclip) remain inert, as the mock draws them.
