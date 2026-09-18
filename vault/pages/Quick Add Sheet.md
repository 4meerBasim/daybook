# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` rendered inside `MainTabs`, opened by the `adding` flag
Summary: The pen-FAB capture sheet: one line of input that is syntax-highlighted live, with parsed chips and a destination hint underneath.

## Related
- Connects to: [[Main Tabs]] — opened by the pen FAB from any tab and closed by pan-down or backdrop tap, [[Today]], [[Upcoming]], [[Inbox]], [[Search]]
- Features: [[Natural Language Quick Add]], [[Pen FAB Tab Bar]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]]
- Enhancements: none

## Notes
`src/screens/QuickAddSheet.tsx`. The visible text is a transparent `BottomSheetTextInput` sitting on top of an absolutely positioned coloured `Text` built from the parser's tokens, which is how the underlining follows typing. The dashed chip at the end of the row reads "Saved to Upcoming" or "Saved to Inbox" from `parsed.hasDate`, which is why this sheet points at both [[Upcoming]] and [[Inbox]].
