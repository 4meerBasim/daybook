# Stack Screens Reserve Tab Bar Space

Status: not-fixed
Found: `src/screens/CalendarScreen.tsx:41`, `src/screens/TaskDetailScreen.tsx:69`
Summary: Two stack screens that never show the tab bar still reserve `metrics.tabBar` (84pt) of bottom padding for it.

## Details
[[Calendar]] and [[Task Detail]] are `Stack.Screen` routes in `src/navigation/Root.tsx`, not panes inside `MainTabs`. [[Glass Tab Bar]] only renders inside `MainTabs`, so neither screen has a bar at the bottom — yet both still pad for one.

[[Task Detail]] is the milder case: 84pt of dead slack at the end of a `ScrollView`. [[Calendar]] is worse — the padding is on a `flex: 1` `View`, so the 84pt is cut off the calendar grid itself rather than added as scroll slack.

Pre-existing; it predates the floating-glass restyle and survived the tab-bar redesign untouched. Both passes left these two alone on purpose: the real tab panes use the `useTabBarFootprint()` hook, and `metrics.tabBar` was deliberately kept at its original 84 so these two screens' layout did not silently shift. The fix is to drop the `paddingBottom` from both, and then `metrics.tabBar` can go away entirely.

Still verified against the current code: `metrics.tabBar: 84` is in `src/theme/tokens.ts`, and these two screens are its only readers. The three panes and [[Search Results]] all call the hook, which now returns `tabBarHeight + metrics.tabBarLift + max(safeAreaBottom, tabBarMinBottom)` — `tabBarLift` replaced `penLift` when the pen was flattened, but the hook's shape and the reason it has to be computed are unchanged. See [[Pen FAB]].

## Related
- Page: [[Calendar]], [[Task Detail]], [[Main Tabs]], [[Search Results]]
- Feature: [[Glass Tab Bar]], [[Pen FAB]]
