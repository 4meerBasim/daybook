# Settings

Route: `Settings` (native stack)
Summary: One ruled row per preference — language, appearance, week start, reminders, text size, reduce motion, sync, shortcuts, sharing.

## Related
- Connects to: [[Today]] — reached by long-pressing the Today tab; returns via the system back gesture, [[Main Tabs]], [[Swipe States]] — the Shortcuts row calls `onOpenGestures`
- Features: [[Offline First Local Store]], [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Swipe Row Actions]], [[Ledger Paper Chrome]]
- Bugs: none found
- Enhancements: [[Adaptive Reminders]], [[Shared Page Link]], [[Ink Decay and Task Retirement]]

## Notes
`src/screens/SettingsScreen.tsx`. Three rows are live and write straight to the theme context: Language toggles en/ar, Appearance is a three-way `Segmented` for light/dark/auto, and Reduce motion is a `Toggle`. Week start, reminders, text size, sync and sharing render their values but are not editable. Shortcuts is the only row wired as a `Pressable`, and it is the sole entry point to [[Swipe States]].

The rows sit at `minHeight: unit` rather than a fixed 56, so they follow [[Ledger Paper Chrome]]'s ruling unit at larger text sizes. Their labels keep `numberOfLines={1}`: a preference name is chrome, and the Text size row says `System` because the app takes the system font scale rather than offering its own control — that scale is exactly what steps the ruling unit.

The Sync row stays inert on purpose. [[Offline First Local Store]] is local-only and off-network by design — sync is optional and later, not a prerequisite. The Reminders row's "evening review 20:30" is now backed by a named constant in `src/db/reminders.ts`, which is as far as notification work goes until [[Adaptive Reminders]] lands.
