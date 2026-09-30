# Main Tabs

Route: `Main` (native stack screen wrapping the `MainTabs` component in `src/navigation/Root.tsx`)
Summary: The tab shell that hosts the three primary lists and the profile page, the pen FAB, and the quick-add sheet, and that owns the long-press shortcuts to the secondary screens.

## Related
- Connects to: [[Today]], [[Recent]], [[Inbox]], [[Profile]], [[Quick Add Sheet]], [[Settings]], [[Calendar]], [[Inbox Empty]], [[Task Detail]], [[Project Detail]], [[Page Closed]], [[Swipe States]], [[Onboarding]], [[Focus Mode]]
- Features: [[Pen FAB Tab Bar]], [[Project Grouped Tasks]], [[Inline Page Search]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Focus Mode Unreachable]], [[Quick Add Sheet Shown On Launch]]
- Enhancements: none

## Notes
Tab switching is local `useState` inside `MainTabs`, not a navigator — only one of the four screens is mounted at a time. The stack routes are reached from here:

| Gesture | Destination |
|---|---|
| Tap pen FAB | [[Quick Add Sheet]] |
| Long-press Today tab | [[Settings]] |
| Long-press Inbox tab | [[Inbox Empty]] |
| Tap a project row on Today or Inbox | [[Project Detail]], filtered to that list |
| Long-press a task row on Recent | [[Task Detail]] |
| Swipe a task row on Recent past the pick-date threshold | [[Calendar]] |
| Tap the wax stamp on Today | [[Page Closed]] |
| Tap the Projects row on Profile | [[Project Detail]], Studio across all lists |
| Tap the Settings row on Profile | [[Settings]] |

[[Recent]] is the one tab that lists task rows; [[Today]] and [[Inbox]] list projects. The same two task-row gestures therefore also start one level down on [[Project Detail]]: long-pressing a task row opens [[Task Detail]], and swiping a row past the pick-date threshold opens [[Calendar]]. The Recent tab itself has no long-press shortcut — the one that opened [[Calendar]] from the old Upcoming tab was removed with that tab.

[[Project Detail]] and [[Page Closed]] both return here via `navigation.goBack()`. [[Focus Mode]] is registered on this stack but has no caller — see [[Focus Mode Unreachable]].
