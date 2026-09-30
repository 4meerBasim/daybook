# Calendar

Route: `Calendar` (native stack)
Summary: A month grid where each day carries tally marks for its workload, with the selected day's tasks listed underneath.

## Related
- Connects to: [[Project Detail]], [[Recent]] — reached by swiping a task row past the pick-date threshold on either, the only way in; returns via the system back gesture, [[Main Tabs]]
- Features: [[Calendar Tally Marks]], [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/CalendarScreen.tsx`. Day selection lives in `sel` on the shared store, so the chosen day survives leaving and re-entering the screen. The leading blank-cell offset changes with locale (`ar ? 3 : 1`) to match the week-start difference, and the grid itself flips direction with `row(rtl)`. Day 18 is hardcoded as today and always shows three tasks.
