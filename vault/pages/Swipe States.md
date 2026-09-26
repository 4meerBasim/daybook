# Swipe States

Route: `SwipeStates` (native stack)
Summary: A gesture reference page showing each swipe threshold held open — complete, snooze, pick date, delete — plus the long-press reorder state, each with an annotation row.

## Related
- Connects to: [[Settings]] — reached from the Shortcuts row; returns via the system back gesture, [[Main Tabs]], [[Project Picker]] — what long-press actually does now
- Features: [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Waiting On Follow-Ups]]

## Notes
`src/screens/SwipeStatesScreen.tsx`. The demo rows are a static illustration, not live `SwipeableRow` instances — each one hardcodes its own action pane and a fixed face offset, sign-flipped for RTL, exactly as the mock does. Keeping them inert means the reference positions cannot be knocked out of place by a touch, and it lets the delete row show the vermilion pane even though its 200pt offset is only about half the row width, below the real 70% threshold. The live gestures are on [[Today]].

The fourth row, "Long-press — lift to reorder", is the one piece of this reference the app now contradicts. The mock assigns long-press twice: to reorder here, and to the project picker in its Inbox caption. Reorder is not implemented anywhere, the picker is, so a real long-press on [[Inbox]] or [[Project Detail]] opens [[Project Picker]] and this row stays the static illustration it always was. If reorder ever ships it will need a different gesture or a different surface.

They are a `DemoRow` component rather than a local function now, because each one needs its own `useRuling` to sit on the ruling unit — a function called four times inside the screen cannot hold a hook. The reorder row is the same component with no pane, a `lifted` background and the drag handle passed as trailing content, which is what removed the fourth copy of the row markup.
