# Swipe States

Route: `SwipeStates` (native stack)
Summary: A gesture reference page showing each swipe threshold held open — complete, snooze, pick date, delete — plus the long-press reorder state, each with an annotation row.

## Related
- Connects to: [[Settings]] — reached from the Shortcuts row; returns via the system back gesture, [[Main Tabs]]
- Features: [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: none

## Notes
`src/screens/SwipeStatesScreen.tsx`. The demo rows are a static illustration, not live `SwipeableRow` instances — each one hardcodes its own action pane and a fixed face offset, sign-flipped for RTL, exactly as the mock does. Keeping them inert means the reference positions cannot be knocked out of place by a touch, and it lets the delete row show the vermilion pane even though its 200pt offset is only about half the row width, below the real 70% threshold. The live gestures are on the task rows of [[Project Detail]].
