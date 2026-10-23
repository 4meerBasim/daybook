# Stack Screens Ignore The Bottom Safe Area

Status: fixed
Found: `src/components/Screen.tsx:15` — applied no bottom inset, and no stack screen supplied one itself
Fixed: `src/components/Screen.tsx` — `useScreenBottom()` returns `max(insets.bottom, metrics.gutter)`, and every scrolling stack screen pads its content to it
Summary: The scrolling stack screens end their content at the physical bottom edge, under the home indicator, because `Screen` pads neither edge and `useTabBarFootprint()` — the one mechanism that folds the inset in — applies only to screens that sit under the tab bar.

## Details
`Screen` sets `flex: 1`, a paper background and `overflow: 'hidden'`, and nothing else. `useHeaderTop()`, in the same file, returns `insets.top + 2` and most screens call it for the top. There is no counterpart for the bottom, and there is no `SafeAreaView` anywhere in the repo — `SafeAreaProvider` in `App.tsx` only supplies the values.

The three panes inside `MainTabs` and [[Search Results]] are fine, and deliberately so: `useTabBarFootprint()` returns `tabBarHeight + tabBarLift + max(insets.bottom, tabBarMinBottom)`, and [[Glass Tab Bar]] documents why that has to be computed rather than a constant — a fixed reserve sized for a 12pt inset falls 10pt short on a 34pt home indicator. The inset is handled there by design. What is missing is any equivalent for a screen with no bar.

So the affected set is the stack routes that scroll and can therefore reach their own bottom edge: [[Settings]], [[Task Detail]], [[Projects]], [[Project Detail]] and [[Unfiled]]. [[Settings]] is the sharpest of them — `SettingsScreen` has a bare `ScrollView` with no `contentContainerStyle` at all, so its last rule sits flush on the physical edge, where the other four at least pad to `metrics.gutter` (20), which covers a 12pt inset but not a 34pt one.

[[Page Closed]] and [[Swipe States]] apply no bottom inset either, but neither has a symptom today: both are top-anchored, non-scrolling, and their content runs roughly 640-650pt on an 852pt viewport, so nothing of theirs comes near the gesture area. They are latent rather than broken — a taller device-font setting or more rows would expose them.

[[Onboarding]] and [[Focus Mode]] are not affected. Both clear the indicator with a hardcoded constant — `marginBottom: 56` and an absolute `bottom: 56` — which exceeds the 34pt maximum. That works without reading the inset, so they are correct by accident rather than by mechanism.

`Sheet` already does the right thing (`paddingBottom: inset.bottom + 16`), which is the shape the fix should take: a bottom counterpart to `useHeaderTop()` that every stack screen calls, rather than a `paddingBottom` edited into each one.

Noticed while fixing [[Stack Screens Reserve Tab Bar Space]] and deliberately left out of that branch — it is a different concern and it touches five screens rather than two.

## Fix
`Screen.tsx` gained `useScreenBottom()`, the bottom counterpart to `useHeaderTop()`: `Math.max(insets.bottom, metrics.gutter)`. The `max` is what makes it a drop-in — a 34pt home indicator gets 34, a 12pt or 0pt inset still gets the 20pt gutter the four padded screens already had, so nothing loses spacing.

Applied to every stack screen that scrolls: [[Settings]] (which had no `contentContainerStyle` at all), [[Task Detail]], [[Projects]], [[Project Detail]], [[Unfiled]] and [[Calendar]]. Calendar was not in the original affected set — its inner `ScrollView` arrived later with the real-month work, and it had no bottom padding either. [[Page Closed]] took the pad on its final block, because the Plan Tomorrow button is a real tap target that was flowing toward the gesture area.

[[Swipe States]] is left alone on purpose: its last element is `EmptyRules`, decorative ruling that belongs to the `Ledger` grid, and padding inside it would break the ruling rhythm for a demo screen with no tap target near the edge.

Unchanged by design: the three [[Glass Tab Bar]] panes and [[Search Results]] keep `useTabBarFootprint()`, and [[Onboarding]] and [[Focus Mode]] keep their 56pt constants, which already clear the 34pt maximum.

## Related
- Page: [[Settings]], [[Task Detail]], [[Projects]], [[Project Detail]], [[Unfiled]], [[Calendar]], [[Page Closed]], [[Swipe States]], [[Search Results]], [[Onboarding]], [[Focus Mode]]
- Features: [[Ledger Paper Chrome]], [[Glass Tab Bar]]
- Bugs: [[Stack Screens Reserve Tab Bar Space]], [[Calendar Overflow Is Unreachable]], [[Theme Preferences Reset On Every Launch]]
