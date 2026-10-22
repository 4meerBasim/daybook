# Reduced Motion Mode

Status: shipped
Summary: A single settings toggle turns every animation in the app into an instant state change, without removing the state change itself.

## Details
`motion` lives on the theme context (`src/theme/ThemeProvider.tsx`) as `full` | `reduced`, with `reduced` exposed as a boolean, and persists to the `prefs` table so the choice survives a relaunch — see [[Theme Preferences Reset On Every Launch]]. It is honoured everywhere motion exists, and in every case the animated value is *assigned* rather than removed, so the end state is identical:

| Where | Reduced behaviour |
|---|---|
| `TaskRow.tsx` | stroke width and dry colour jump to target — see [[Ink Strike-Through Completion]] |
| `SwipeableRow.tsx` | the row settles to zero instantly — see [[Swipe Row Actions]] |
| `Stamp.tsx` | opacity 0.9 and scale 1 with no overshoot — see [[Wax Page Closed Stamp]] |
| `Toggle.tsx` | the knob snaps |
| `PageHeader.tsx` | the scroll-linked style returns `{}`, so the title stays at 40pt — see [[Collapsing Page Header]] |
| `FocusScreen.tsx` | the minute strips fill without the 600ms colour interpolation — see [[Focus Timer]] |
| `QuickAddSheet.tsx` | `animateOnMount` and `autoFocus` are both disabled, so the sheet and keyboard appear without a transition |
| `TabBar.tsx` | the sliding indicator's `translateX` and each item's opacity and label colour are assigned, so the active tab changes with no travel — see [[Glass Tab Bar]] |
| `Root.tsx` | the pane strip's `translateX` is assigned, so a tab switch cuts instead of sliding — see [[Animated Page Transitions]] |
| `Root.tsx` | `searchProgress` is assigned, so the search field appears at full width with the overlay already opaque; the field also skips `autoFocus` — see [[Expanding Search Field]] |

The three animations added in the tab-bar redesign all follow the same rule. Each one is a `withTiming` inside a `useEffect` with `reduced` in its dependency list, and the reduced branch writes the identical target value directly to the shared value, so the resting layout is byte-identical either way and only the transit disappears.

Controlled from the Reduce motion row in the shared `SettingsRows` list, which both [[Settings]] and [[Profile]] render.

## Related
- Page: [[Settings]], [[Profile]], [[Main Tabs]], [[Today]], [[Focus Mode]], [[Quick Add Sheet]], [[Search Results]], [[Swipe States]], [[Page Closed]]
- Features: [[Ink Strike-Through Completion]], [[Swipe Row Actions]], [[Wax Page Closed Stamp]], [[Collapsing Page Header]], [[Focus Timer]], [[Glass Tab Bar]], [[Animated Page Transitions]], [[Expanding Search Field]]
- Bugs: [[Startup Crash From Mismatched Worklets]], [[Theme Preferences Reset On Every Launch]]
- Enhancements: [[Ink Decay and Task Retirement]]
