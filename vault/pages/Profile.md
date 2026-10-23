# Profile

Route: `Main` → tab key `profile` (third and last pane)
Summary: The user's own page — an ink initials avatar, their name in 40pt serif, and the full preferences list underneath.

## Related
- Connects to: [[Main Tabs]], [[Quick Add Sheet]] — the Add item in the bar, [[Search Results]] — the overlay that covers this pane, [[Swipe States]] — the Shortcuts row calls `onOpenGestures`, [[Projects]] — the Projects row calls `onOpenProjects`, [[Unfiled]] — the Unfiled row calls `onOpenUnfiled`, [[Today]], [[Upcoming]] — the sibling panes it slides between, [[Settings]] — the stack screen rendering the same rows, [[Closed Pages]], [[Weekly Review]], [[Deal]]
- Features: [[Glass Tab Bar]], [[Animated Page Transitions]], [[Offline First Local Store]], [[Projects As A Real Entity]], [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Ledger Paper Chrome]], [[Closing the Page Ritual]], [[Ink Decay and Task Retirement]], [[Weekly Spread Review]], [[Deal Me One Task Picker]]
- Bugs: [[Theme Preferences Reset On Every Launch]], [[Active Tab Icon Knockout Is Opaque On Glass]], [[Undated Unassigned Tasks Have No Screen]] — resolved; the Unfiled row here now reaches the list
- Enhancements: [[Adaptive Reminders]], [[Shared Page Link]] — the free long-press this pane now has

## Notes
`src/screens/ProfileScreen.tsx`. The header block is one `Pressable`: a `metrics.avatar` (48) circle filled `c.ink` holding the name's initials in mono over the 40pt display name, with an italic "Tap to write your name" line below it while the name is unset. Pressing anywhere in that block opens `NameSheet`, which writes through the store's `setDisplayName` into the `prefs` table — see [[Offline First Local Store]]. Unset, the name falls back to `t.you` and `initials()` runs on that instead.

Everything below the header is `src/components/SettingsRows.tsx`, the row list this page shares verbatim with [[Settings]]. Two pages render the same rows because the rows reached the tab bar before the screen did: Profile is a pane, [[Settings]] is the stack screen behind the long-press on the Today tab, and neither is a copy of the other.

The avatar's `radius.pen` is the last thing outside `FocusScreen.tsx` still reading a pen token — see [[Pen FAB]].

It reserves `useTabBarFootprint()` at the bottom like the other two panes, and it has no [[Collapsing Page Header]] — the name block is its own header and does not collapse.

The unfiled captures that lost their screen now have one: an Unfiled row sits under Projects in the shared rows and opens the [[Unfiled]] stack screen — see [[Undated Unassigned Tasks Have No Screen]]. [[Settings]] carries the same row, so this pane is one of two entry points, not the host itself.
