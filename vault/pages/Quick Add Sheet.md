# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` rendered inside `MainTabs`, opened by the `adding` flag
Summary: The pen-FAB capture sheet: one line of input that is syntax-highlighted live, with parsed chips and a destination hint underneath.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by pan-down or backdrop tap, [[Today]], [[Upcoming]], [[Inbox]], [[Search]]
- Features: [[Natural Language Quick Add]], [[Offline First Local Store]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Bottom Sheet Text Input Crashes On Web]]
- Enhancements: [[Day Capacity Budget]], [[Voice Brain Dump Capture]], [[System Capture Entry Points]]

## Notes
`src/screens/QuickAddSheet.tsx`. The visible text is a transparent `BottomSheetTextInput` sitting on top of an absolutely positioned coloured `Text` built from the parser's tokens, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Upcoming" or "Saved to Inbox" from `parsed.hasDate`, which is why this sheet points at both [[Upcoming]] and [[Inbox]].

Add now commits. `onAdd` runs `draft()` from `src/lib/parse.ts` over the same parse output the highlighting uses, inserts the task through the store, clears the draft and closes the sheet — see [[Quick Add Does Not Create Tasks]] for what it resolves and what it deliberately leaves in the title. The destination the chip promises is honoured exactly: a due date is written only when `hasDate` is true, so a bare time with no day goes to [[Inbox]] as drawn.

The draft starts empty rather than pre-filled, and only Add clears it — a sheet dismissed by pan-down or backdrop tap keeps what was typed.

The four tool buttons (calendar, flag, hash, paperclip) remain inert, as the mock draws them.
