# Main Tabs

Route: `Main` (native stack screen wrapping the `MainTabs` component in `src/navigation/Root.tsx`)
Summary: The tab shell that hosts the three primary lists and the profile page, the pen FAB, and the quick-add sheet, and that owns the long-press shortcuts to the secondary screens.

## Related
- Connects to: [[Today]], [[Upcoming]], [[Inbox]], [[Profile]], [[Quick Add Sheet]], [[Settings]], [[Calendar]], [[Inbox Empty]], [[Task Detail]], [[Project Detail]], [[Page Closed]], [[Swipe States]], [[Onboarding]], [[Focus Mode]]
- Features: [[Pen FAB Tab Bar]], [[Project Grouped Tasks]], [[Inline Page Search]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: none

## Notes
Tab switching is local `useState` inside `MainTabs`, not a navigator — only one of the four screens is mounted at a time. The stack routes are reached from here:

| Gesture | Destination |
|---|---|
| Tap pen FAB | [[Quick Add Sheet]] |
| Long-press Today tab | [[Settings]] |
| Long-press Upcoming tab | [[Calendar]] |
| Long-press Inbox tab | [[Inbox Empty]] |
| Tap a project row on Today, Upcoming or Inbox | [[Project Detail]], filtered to that list |
| Tap the wax stamp on Today | [[Page Closed]] |
| Tap the Projects row on Profile | [[Project Detail]], Studio across all lists |
| Tap the Settings row on Profile | [[Settings]] |

Task rows no longer sit on a tab, so two gestures that used to start here now start one level down on [[Project Detail]]: long-pressing a task row opens [[Task Detail]], and swiping a row past the pick-date threshold opens [[Calendar]].

[[Project Detail]] and [[Page Closed]] both return here via `navigation.goBack()`. [[Focus Mode]] is registered on this stack but has no caller — see [[Focus Mode Unreachable]].
