# Settings

Route: `Settings` (native stack)
Summary: One ruled row per preference — language, appearance, week start, reminders, text size, reduce motion, sync, shortcuts, projects, sharing.

## Related
- Connects to: [[Today]] — reached by long-pressing the Today tab; returns via the system back gesture, [[Main Tabs]], [[Profile]] — the pane rendering the same rows, [[Swipe States]] — the Shortcuts row calls `onOpenGestures`, [[Projects]] — the Projects row calls `onOpenProjects`, [[Unfiled]] — the Unfiled row calls `onOpenUnfiled`, [[Closed Pages]], [[Weekly Review]], [[Notes]]
- Features: [[Offline First Local Store]], [[Projects As A Real Entity]], [[Glass Tab Bar]] — the long-press that reaches this screen, [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[Day Capacity Budget]], [[Closing the Page Ritual]], [[Ink Decay and Task Retirement]], [[Weekly Spread Review]], [[Notes With Live Task Lines]], [[Adaptive Reminders]]
- Bugs: [[Stack Screens Ignore The Bottom Safe Area]], [[Stack Screens Reserve Tab Bar Space]], [[Native Layout Direction Is Not Pinned]], [[Theme Preferences Reset On Every Launch]], [[Onboarding Shows On Every Launch]]
- Enhancements: [[Shared Page Link]]

## Notes
`src/screens/SettingsScreen.tsx`, which is now a thin wrapper: the rows themselves live in `src/components/SettingsRows.tsx` and are rendered verbatim by [[Profile]] as well. Three of them are live and write straight to the theme context: Language toggles en/ar, Appearance is a three-way `Segmented` for light/dark/auto, and Reduce motion is a `Toggle`. Week start, reminders, text size, sync and sharing render their values but are not editable.

Three rows navigate. Shortcuts reaches [[Swipe States]]. Projects, above Sharing, shows the live project count in the value column and reaches [[Projects]] — see [[Projects As A Real Entity]]. The Unfiled row directly below Projects shows the count of undated, unassigned captures and reaches [[Unfiled]] — the surface [[Undated Unassigned Tasks Have No Screen]] was missing. Both are reachable from [[Profile]] too, since it draws the same list; this screen is no longer the sole entry point to either. Projects sits in these rows rather than on the tab bar because the bar's items are fixed, and because the deferred desktop layout puts projects in a sidebar rather than a tab.

This screen and [[Profile]] overlap heavily now and only one of them is on the bar. Nothing in the code says which is meant to survive; the long-press on the Today tab is still the only way here.

The rows sit at `minHeight: unit` rather than a fixed 56, so they follow [[Ledger Paper Chrome]]'s ruling unit at larger text sizes. Their labels keep `numberOfLines={1}`: a preference name is chrome, and the Text size row says `System` because the app takes the system font scale rather than offering its own control — that scale is exactly what steps the ruling unit.

The Sync row stays inert on purpose. [[Offline First Local Store]] is local-only and off-network by design — sync is optional and later, not a prerequisite. The Reminders row's "evening review 20:30" is now backed by a named constant in `src/db/reminders.ts`, which is as far as notification work goes until [[Adaptive Reminders]] lands.
