# Main Tabs

Route: `Main` (native stack screen wrapping the `MainTabs` component in `src/navigation/Root.tsx`)
Summary: The tab shell that hosts the three primary panes, the quick-add sheet and the search overlay, and that owns the long-press shortcuts to the secondary screens.

## Related
- Connects to: [[Today]], [[Upcoming]], [[Profile]], [[Search Results]], [[Quick Add Sheet]], [[Settings]], [[Calendar]], [[Task Detail]], [[Project Detail]], [[Projects]], [[Project Picker]], [[Page Closed]], [[Swipe States]], [[Onboarding]], [[Focus Mode]], [[Unfiled]]
- Features: [[Glass Tab Bar]], [[Animated Page Transitions]], [[Expanding Search Field]], [[Pen FAB]], [[Projects As A Real Entity]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Reduced Motion Mode]]
- Bugs: [[Focus Mode Unreachable]], [[Startup Crash From Mismatched Worklets]], [[Stack Screens Reserve Tab Bar Space]], [[Active Tab Icon Knockout Is Opaque On Glass]], [[Undated Unassigned Tasks Have No Screen]], [[Native Layout Direction Is Not Pinned]]
- Enhancements: [[Deal Me One Task Picker]], [[Inbox Triage Chips]], [[System Capture Entry Points]]

## Notes
Tab switching is local `useState` inside `MainTabs`, not a navigator. `TABS` is `['today', 'upcoming', 'profile']` — three panes, down from five since the Inbox and Search tabs were removed. All three stay mounted inside one horizontal strip and the strip slides; the old `display: none` toggling is gone, and each `Pane` now takes a `shown` flag that hides the two inactive ones from the accessibility tree, which `display: none` used to do on its own — see [[Animated Page Transitions]].

`MainTabs` owns four pieces of state: the active `tab`, `adding` for [[Quick Add Sheet]], `searching` for [[Search Results]], and the search `query`. The `searchProgress` shared value lives here too, because both the bar and the overlay read it — see [[Expanding Search Field]].

The stack routes are reached from here:

| Gesture | Destination |
|---|---|
| Tap Add in the bar | [[Quick Add Sheet]] |
| Tap the search button | [[Search Results]] |
| Long-press Today tab | [[Settings]] |
| Long-press Upcoming tab | [[Calendar]] |
| Long-press a Today row | [[Task Detail]] |
| Tap the wax stamp on Today | [[Page Closed]] |
| Tap the `#invoice` result in search | [[Project Detail]] |
| Shortcuts row on Profile | [[Swipe States]] |
| Projects row on Profile | [[Projects]] |

Long-press Profile is unassigned — the third shortcut slot freed up when the Inbox tab went, and nothing claims it yet.

Two of the old rows are gone with the Inbox pane: long-press the Inbox tab for the `InboxEmpty` route, which is no longer registered, and long-press an Inbox row for [[Project Picker]], which is now reached only from a [[Project Detail]] row.

`Project` is the one route on this stack that takes a param, `{ projectId }`. [[Projects]] and [[Swipe States]] are reached from the rows [[Profile]] and [[Settings]] share — see [[Projects As A Real Entity]].

[[Task Detail]] and [[Page Closed]] both return here via `navigation.goBack()`. [[Focus Mode]] is opened from the ellipsis on [[Task Detail]] — see [[Focus Mode Unreachable]].
