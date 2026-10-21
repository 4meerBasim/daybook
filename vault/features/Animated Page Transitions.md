# Animated Page Transitions

Status: shipped
Summary: Switching tabs slides the three panes horizontally like turning a page, instead of cutting from one to the next.

## Details
`MainTabs` in `src/navigation/Root.tsx`. The three panes live inside one `Animated.View` that is `width * TABS.length` wide with `flexDirection: row(rtl)`, and each pane is a `Pane` fixed at `width`. Switching tabs moves the whole strip rather than swapping what is mounted.

The offset is derived, not stored: `-(rtl ? TABS.length - 1 - index : index) * width`, where `index` is the active tab's position in `TABS` (`['today', 'upcoming', 'profile']`) and `width` comes from `useWindowDimensions()`. A `useEffect` drives the shared value to that offset with `withTiming(duration.page, easing.standard)` — 320ms, which is the full-page band rather than the 180ms `duration.ui` the [[Glass Tab Bar]] indicator uses. Deriving the offset from the index means a rotation or an RTL flip recomputes it and the effect re-runs, so the strip never ends up parked between panes.

This replaced `display: none` toggling. Under the old scheme all five panes stayed mounted and only the active one was `display: flex`, so there was no travel to animate and no way to see the direction of a switch. Mounting is unchanged — all three panes are still mounted at once, which is what keeps each list's scroll position and header collapse across a switch.

Keeping them all mounted and on-screen is what the `shown` prop is for. `display: none` used to hide the inactive panes from the accessibility tree for free; a strip that only translates leaves all three in it, so a screen reader would walk straight off Today into Upcoming's rows. `Pane` takes `shown={tab === '<key>'}` and sets `accessibilityElementsHidden` and `importantForAccessibility: 'no-hide-descendants'` on the two inactive panes, which restores the boundary that the `display` toggle gave implicitly. See [[In-App RTL and Arabic Typography]] for the other invariant the strip has to hold.

The strip is the only thing that moves. The bar and the [[Search Results]] overlay are siblings of it inside `Screen`, positioned absolutely, so neither slides with the panes.

There is no gesture. The carousel is driven by the tab bar only; swiping between panes is not wired, and the panes themselves own horizontal pan for [[Swipe Row Actions]], which would have to be arbitrated first.

Under [[Reduced Motion Mode]] the offset is assigned instead of timed, so the pane changes instantly and lands in exactly the same place — the same assign-not-remove rule the rest of the app follows.

## Related
- Page: [[Main Tabs]], [[Today]], [[Upcoming]], [[Profile]]
- Features: [[Glass Tab Bar]], [[Expanding Search Field]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Startup Crash From Mismatched Worklets]]
