# Settings

Route: `Settings` (native stack)
Summary: One ruled row per preference — language, appearance, week start, reminders, text size, reduce motion, sync, shortcuts, sharing.

## Related
- Connects to: [[Today]] — reached by long-pressing the Today tab; returns via the system back gesture, [[Main Tabs]], [[Swipe States]] — the Shortcuts row calls `onOpenGestures`
- Features: [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Swipe Row Actions]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/SettingsScreen.tsx`. Three rows are live and write straight to the theme context: Language toggles en/ar, Appearance is a three-way `Segmented` for light/dark/auto, and Reduce motion is a `Toggle`. Week start, reminders, text size, sync and sharing render their values but are not editable. Shortcuts is the only row wired as a `Pressable`, and it is the sole entry point to [[Swipe States]].
