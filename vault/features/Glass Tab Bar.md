# Glass Tab Bar

Status: shipped
Summary: A floating glass pill holding four flat items — Today, Upcoming, Add, Profile — with a rounded indicator that slides to the active tab, and a round search button beside it.

## Details
`src/components/TabBar.tsx`. The bar is a floating capsule rather than a bar pinned to the screen edge: `metrics.tabBarHeight` (64) tall, inset `metrics.tabBarInset` (12) from both sides, fully rounded at `radius.bar` (32), and sitting `max(safeAreaBottom, metrics.tabBarMinBottom)` off the bottom. It clears the home indicator on its own, because `Screen` applies no bottom inset.

The glass is an `expo-blur` `BlurView` plus a translucent tint, both inside a clipping child so the rounded corners cut the blur. Both values come from `glass(c, dark)` in the tokens: blur 56 light / 48 dark, tint `paper2` at ~66% / ~69%. The shell is a hairline border and nothing else — **no shadow in either mode**. Two reasons it cannot have one: `c.ink` is cream in the dark palette, so a shadow drawn in it reads as a glow; and the shell has no `backgroundColor` (the tint lives on a child, since an opaque parent would defeat the blur), which leaves iOS without a `shadowPath` and Android without a drawable outline to derive one from. Lift is carried by the inset, the radius and the border instead.

The same `Glass` child is reused by the search capsule, so the pill and the search button are one material — see [[Expanding Search Field]].

### Layout
Two siblings inside one absolutely positioned, `box-none` wrapper. The pill is pinned to the leading edge with `insetStart(rtl, 0)` and is `inner - capsule - metrics.gap` wide, where `inner` is the screen minus both insets and `capsule` is `tabBarHeight`. The search capsule is pinned to the trailing edge with `insetEnd(rtl, 0)` and is square at rest. Nothing is centred and nothing overlaps, which is what removed the old equal-flex balancing act — see [[Pen FAB]].

`ITEMS` is a flat four-key row, `['today', 'upcoming', 'add', 'profile']`, each item `flex: 1` with `minWidth: metrics.minTap` (44) and `metrics.tab` (56) tall. `add` is not a tab: it carries `accessibilityRole="button"` rather than `"tab"`, no `accessibilityState`, uses `PlusIcon` and the `t.add` label, and fires a medium haptic before opening [[Quick Add Sheet]]. The other three call `onSelect` with their `TabKey`.

Width is tight. Four slots come out of `(pillWidth - 2 border - 8 padding) / 4`, which at the common 360pt Galaxy width leaves about 68pt each — comfortably past the 44pt floor, where the old five-tab-around-a-spacer split had only ~45pt to work with. The 12pt inset and 4pt padding are still chosen for that budget.

### Active indicator
An absolutely positioned rounded rect, `slot - 8` wide and 44 tall at `radius` 22, filled `c.ink` at 12% light / 19% dark, sitting behind the items and `pointerEvents="none"`. Its `translateX` is a shared value driven to `(rtl ? last - index : index) * slot + 8` with `withTiming(duration.ui, easing.standard)`, so it slides between tabs rather than cutting. The resting position is computed from the item index, not stored, so a width change or an RTL flip lands it correctly without an extra pass.

Each item also animates its own face: the icon sits in an `Animated.View` whose opacity ramps 0.78 to 1, and the label carries an `interpolateColor` from `c.ink2` to `c.ink`, both on `duration.ui`. Opacity is kept off the label on purpose — an earlier 0.58 floor applied to the whole group dropped the inactive label to about 2:1 against the glass, well under the AA floor `foundation/design.md` requires, so the label now changes colour only and inactive text sits on `ink2` rather than `ink3`. The `add` item holds both at 1 permanently, since it has no selected state. Icons draw at `c.ink` and the `paper` knockout prop is gone from the codebase — that is what closed [[Active Tab Icon Knockout Is Opaque On Glass]].

Under [[Reduced Motion Mode]] the indicator and every face value are assigned instead of timed, so the end state is identical with no travel.

### Footprint
The three tab panes reserve bottom space with `useTabBarFootprint()`, exported from the same file, which returns `tabBarHeight + metrics.tabBarLift + max(safeAreaBottom, tabBarMinBottom)`. `tabBarLift` (16) replaced the old `penLift` and is now plain breathing room above the capsule rather than clearance for a raised button. It has to be computed rather than a constant, because the capsule's position is inset-derived: a fixed reserve sized for a 12pt inset falls 10pt short on a 34pt home indicator. [[Search Results]] reserves the same footprint. `metrics.tabBar` (84) was a second, hardcoded copy of that reserve, read only by [[Calendar]] and [[Task Detail]] — two screens with no tab bar at all. It is deleted. [[Task Detail]] now pads its `ScrollView` to `metrics.gutter`; [[Calendar]]'s copy is gone outright, because on a non-scrolling column of naturally-sized children it never rendered a pixel at any value. The computed hook is the only footprint convention left. See [[Stack Screens Reserve Tab Bar Space]].

### Long-press shortcuts
The `onLongPress` callback is the shortcut layer, wired in `src/navigation/Root.tsx`:

- long-press Today → [[Settings]]
- long-press Upcoming → [[Calendar]]

`add` is excluded — the callback is only passed for `k !== 'add'`. These are the only routes into those two screens; there is no visible button for either. The third shortcut, long-press Profile, is free now that the Inbox tab is gone.

The whole bar mirrors with `row(rtl)`: in Arabic Today sits rightmost, the item order reverses, the indicator's resting index is mirrored, and the pill and search capsule swap edges.

The glass treatment is a deliberate exception to `foundation/design.md`, which bans glassmorphism as identity and allows the pen as the only elevated object. It was requested directly; the rest of the app keeps the flat paper chrome described in [[Ledger Paper Chrome]].

## Related
- Page: [[Main Tabs]], [[Today]], [[Upcoming]], [[Profile]], [[Search Results]], [[Quick Add Sheet]], [[Settings]], [[Calendar]], [[Task Detail]], [[Unfiled]] — a stack screen precisely because the bar stays at three tabs
- Features: [[Expanding Search Field]], [[Animated Page Transitions]], [[Pen FAB]], [[Natural Language Quick Add]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]]
- Bugs: [[Stack Screens Reserve Tab Bar Space]], [[Active Tab Icon Knockout Is Opaque On Glass]], [[Startup Crash From Mismatched Worklets]], [[Undated Unassigned Tasks Have No Screen]] — the Inbox tab this bar dropped, [[Stack Screens Ignore The Bottom Safe Area]], [[Native Layout Direction Is Not Pinned]]
- Enhancements: [[Deal Me One Task Picker]], [[System Capture Entry Points]]
