# Expanding Search Field

Status: shipped
Summary: A round glass search button beside the tab bar that grows into a full-width text field when tapped, fading the tab pill out as it goes.

## Details
One shared value, `searchProgress`, owned by `MainTabs` in `src/navigation/Root.tsx` and passed into both [[Glass Tab Bar]] and [[Search Results]]. It is driven to 1 on open and 0 on close with `withTiming(duration.page, easing.standard)`, so the button, the pill and the overlay are all phases of a single 320ms transition rather than three animations that have to be kept in step.

Three styles read it inside `src/components/TabBar.tsx`:

| Style | Mapping |
|---|---|
| `fieldBox` | `width` from `capsule` (64) to `inner` — the full span between both tab-bar insets |
| `searchGlyph` | the centred magnifier fades out over the first 40% of the progress |
| `fieldInner` | the field row fades in over the last 55%, so the glyph is gone before the content arrives |

The pill gets `pill`: opacity to 0 over the first half of the progress plus a 6% scale-down, and `pointerEvents: 'none'` while `searching`, so the tabs cannot be hit through the fading surface. The capsule stays pinned to the trailing edge with `insetEnd(rtl, 0)` and grows toward the leading one, which is why it can reach full width without being repositioned — and why in Arabic it grows the other way with no extra code.

The expanded state is a `row(rtl)` of a 20pt `SearchIcon` in `c.ink3`, the `TextInput`, and a `CloseIcon` pressable sized to `metrics.minTap` (44) and carrying the `t.cancel` label. The input is mounted only while `searching` — a `flex: 1` spacer holds its place otherwise — so it cannot take focus through the collapsed button. It `autoFocus`es unless [[Reduced Motion Mode]] is on.

`useAnimatedKeyboard()` lifts the bar so the field rides the keyboard instead of being covered by it. Three details are load-bearing. The `translateY` goes on the **outer wrapper**, not on the capsule: the wrapper is a hard 64pt box, so translating a child out of it leaves the child visible but untappable — both engines short-circuit the hit test on a zero `overflowInset`, which is computed from static layout and never sees a runtime transform, so the cancel button would be dead for the whole search session. The offset subtracts the bottom inset (`max(height - bottom, 0)`) because the capsule already sits at `max(safeAreaBottom, 12)` and the keyboard height is measured from the screen edge, so the inset would otherwise be counted twice. And it is multiplied by a platform flag so it only applies on iOS — Android resizes the window for the keyboard, so lifting there would move the bar twice. The lift is also scaled by `searchProgress`, which keeps the bar still when some other keyboard opens, such as [[Quick Add Sheet]].

Closing clears the query as well as the flag, so reopening starts empty — the opposite of the [[Quick Add Sheet]] draft, which is deliberately kept.

Under [[Reduced Motion Mode]] `searchProgress` is assigned instead of timed: the field appears at full width, the pill is already gone and the overlay is already opaque.

This is what replaced the Search tab. There is no `search` key in `TabKey` any more and `src/screens/SearchScreen.tsx` is gone — see [[Search Results]] for the overlay that took its place.

## Related
- Page: [[Search Results]], [[Main Tabs]], [[Project Detail]]
- Features: [[Glass Tab Bar]], [[Animated Page Transitions]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Startup Crash From Mismatched Worklets]]
- Enhancements: [[Notes With Live Task Lines]]
