# Main Tabs

Route: `Main` (native stack screen wrapping the `MainTabs` component in `src/navigation/Root.tsx`)
Summary: The tab shell that hosts the four primary lists, the pen FAB, and the quick-add sheet, and that owns the long-press shortcuts to the secondary screens.

## Related
- Connects to: [[Today]], [[Upcoming]], [[Inbox]], [[Search]], [[Quick Add Sheet]], [[Settings]], [[Calendar]], [[Inbox Empty]], [[Task Detail]], [[Project Detail]], [[Projects]], [[Project Picker]], [[Page Closed]], [[Swipe States]], [[Onboarding]], [[Focus Mode]]
- Features: [[Pen FAB Tab Bar]], [[Projects As A Real Entity]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Focus Mode Unreachable]], [[Startup Crash From Mismatched Worklets]]
- Enhancements: [[Deal Me One Task Picker]]

## Notes
Tab switching is local `useState` inside `MainTabs`, not a navigator — only one of the four screens is mounted at a time. The stack routes are reached from here:

| Gesture | Destination |
|---|---|
| Tap pen FAB | [[Quick Add Sheet]] |
| Long-press Today tab | [[Settings]] |
| Long-press Upcoming tab | [[Calendar]] |
| Long-press Inbox tab | [[Inbox Empty]] |
| Long-press a Today row | [[Task Detail]] |
| Long-press an Inbox row | [[Project Picker]] |
| Tap the wax stamp on Today | [[Page Closed]] |
| Tap the `#invoice` result on Search | [[Project Detail]] |

`Project` is the one route on this stack that takes a param, `{ projectId }`, and [[Projects]] is reached from [[Settings]] rather than from a tab gesture — see [[Projects As A Real Entity]].

[[Task Detail]] and [[Page Closed]] both return here via `navigation.goBack()`. [[Focus Mode]] is registered on this stack but has no caller — see [[Focus Mode Unreachable]].
