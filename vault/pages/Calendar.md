# Calendar

Route: `Calendar` (native stack)
Summary: A real, task-bound month calendar — each day carries tally marks for its workload and a dot for device events; the selected day lists its tasks and events, and tasks can be dragged onto any day to schedule them.

## Related
- Connects to: [[Project Detail]], [[Recent]] — reached by swiping a task row past the pick-date threshold on either; [[Task Details]] — tapping a day's task row opens it; returns via the header back button and the system back gesture, [[Main Tabs]], [[Settings]], [[Today]]
- Features: [[Calendar Tally Marks]], [[Calendar drag-to-schedule]], [[Device calendar overlay]], [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Due-date picker]], [[Local reminders]], [[Reduced Motion Mode]], [[Magic-plus drag insert]]
- Bugs: none found
- Enhancements: [[Timeline and map view]]

## Notes
`src/screens/CalendarScreen.tsx`. No longer static: a `monthCursor` state renders the real current month with prev/next controls (44pt, labelled with the target month name), the real number of days, and the real weekday-of-first alignment. The leading blank-cell offset is computed from the first day's weekday (`(firstDate.getDay() + 6) % 7`, Monday-based) — a single value that mirrors correctly for RTL because each week row flips with `row(rtl)`; the old hardcoded `ar ? 3 : 1` is gone. `today` is the real today, highlighted only when the displayed month contains it.

Day selection still lives in `sel` on the shared store (survives leaving and re-entering), clamped to the month length; on first mount it defaults to today when the current month is shown. Tally counts are bucketed live from `useTasks()` by `dueAt` for the displayed month (replacing the hardcoded `load`/`dayPool` from seed). The selected day lists the real tasks due that day (drag sources) and, when the device overlay is on, a read-only Events subsection. An unscheduled tray (`dueAt == null`) sits at the bottom. The header carries a back button. See [[Calendar drag-to-schedule]] and [[Device calendar overlay]].
