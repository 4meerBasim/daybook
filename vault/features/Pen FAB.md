# Pen FAB

Status: deprecated
Summary: The raised round pen button that used to sit centred over the tab bar as the app's capture affordance, now flattened into an inline Add item.

## Details
Removed in the tab-bar redesign. It is recorded here rather than deleted, because the shape it left behind explains several things in the current code.

What it was: a `metrics.pen` (56) fully rounded `Pressable` filled with `c.ink`, lifted `metrics.penLift` (16) above the glass capsule by the wrapper's extra height, carrying a `penShadow` token, firing a medium haptic before opening [[Quick Add Sheet]]. The five tabs were split around it — Today and Upcoming before, Inbox, Search and Profile after — on equal `flex: 1` with a `metrics.pen`-wide spacer between them, because equal flex is what put the spacer's centre on the bar's centre so the absolutely-centred pen landed in the gap instead of over a tab.

What replaced it: a fourth inline item in the flat `ITEMS` row of [[Glass Tab Bar]], labelled with `t.add`, drawn with `PlusIcon`, keeping the medium haptic and the same `onAdd` call. It is still not a tab — `accessibilityRole="button"`, no selected state — so capture is still distinguishable from navigation, just no longer elevated.

What went with it: `penShadow` is gone from `src/theme/tokens.ts`, and `metrics.penLift` became `metrics.tabBarLift` (16), which now means plain breathing room above the capsule rather than clearance for a raised button. `metrics.pen` and `radius.pen` survive, but only as a 56pt square in `FocusScreen.tsx` and the avatar radius on [[Profile]] — nothing in the tab bar reads either.

`PenIcon` was deleted from `src/components/Icon.tsx` once nothing referenced it. `metrics.pen` and `radius.pen` survive, but only for `FocusScreen` and the Profile avatar.

`foundation/design.md` allows "the pen as the only elevated object" as its single exception to the no-elevation rule. With the pen gone the bar's glass is the only thing still trading on that exception — see [[Glass Tab Bar]].

## Related
- Page: [[Main Tabs]], [[Quick Add Sheet]]
- Features: [[Glass Tab Bar]], [[Natural Language Quick Add]]
- Bugs: [[Active Tab Icon Knockout Is Opaque On Glass]], [[Stack Screens Reserve Tab Bar Space]]
- Enhancements: [[System Capture Entry Points]], [[Deal Me One Task Picker]]
