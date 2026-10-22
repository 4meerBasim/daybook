# Stack Screens Reserve Tab Bar Space

Status: fixed
Found: `src/screens/CalendarScreen.tsx:41`, `src/screens/TaskDetailScreen.tsx:69`
Summary: Two stack screens that never show the tab bar reserved `metrics.tabBar` (84pt) of bottom padding for it; the token is deleted, [[Task Detail]] now pads to `metrics.gutter`, and [[Calendar]]'s copy is gone outright.

## Details
[[Calendar]] and [[Task Detail]] are `Stack.Screen` routes in `src/navigation/Root.tsx`, not panes inside `MainTabs`. [[Glass Tab Bar]] only renders inside `MainTabs`, so neither screen has a bar at the bottom — yet both padded for one.

[[Task Detail]] was the real case: 84pt on a `ScrollView`'s `contentContainerStyle`, which the scroll view genuinely consumes, so the screen ended in 84pt of dead reachable slack. It now pads to `metrics.gutter`, matching [[Project Detail]], [[Projects]] and [[Unfiled]], the three scrolling stack screens that already got this right. Zero would let the last row butt against the physical edge.

[[Calendar]] turned out not to be affected at all, which is the opposite of what this note first claimed. Its `paddingBottom` sat on a `flex: 1` `View` whose four children — header, weekday row, grid, selected-day block — are all naturally sized, with no `flex`, `flexGrow` or percentage height among them. React Native defaults `flexShrink` to **0**, unlike the web, so Yoga never compressed them into the reduced content box; and that `View` sets no `overflow` of its own, so anything taller simply painted through the padding box. Short content made the padding blank space that was already blank; long content painted over it. It never rendered a pixel at 84 or at 20, so the padding was deleted rather than retokenized.

`metrics.tabBar: 84` is deleted from `src/theme/tokens.ts`. These two screens were its only readers, so the two competing conventions in `metrics` are now one: the panes and [[Search Results]] call `useTabBarFootprint()`, which computes `tabBarHeight + tabBarLift + max(safeAreaBottom, tabBarMinBottom)` deliberately rather than as a constant, and scrolling stack screens pad to the gutter. `tabBarHeight`, `tabBarInset`, `tabBarMinBottom` and `tabBarLift` are all still read and stay.

Two wider gaps surfaced while fixing this and were deliberately kept out of the branch. Scrolling stack screens account for no bottom safe-area inset — [[Stack Screens Ignore The Bottom Safe Area]]. And [[Calendar]]'s lack of a scroll view is a real defect of its own, just not this one — [[Calendar Overflow Is Unreachable]].

Not every stack screen pads its bottom even now: `SettingsScreen` has a bare `ScrollView` with no `contentContainerStyle`, and [[Page Closed]] and [[Swipe States]] have no bottom padding either. Those were left alone here because none of them was reserving space for an absent bar, which is what this bug was about.

## Related
- Page: [[Calendar]], [[Task Detail]], [[Main Tabs]], [[Search Results]], [[Unfiled]], [[Projects]], [[Project Detail]], [[Settings]], [[Page Closed]], [[Swipe States]]
- Feature: [[Glass Tab Bar]], [[Pen FAB]]
- Bugs: [[Stack Screens Ignore The Bottom Safe Area]], [[Calendar Overflow Is Unreachable]], [[Undated Unassigned Tasks Have No Screen]] — [[Unfiled]], its fix, is the stack screen that got this padding right first
