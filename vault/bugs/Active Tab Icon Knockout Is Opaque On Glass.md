# Active Tab Icon Knockout Is Opaque On Glass

Status: fixed
Found: `src/components/Icon.tsx:22,39` as used by `src/components/TabBar.tsx`
Summary: The active Today and Profile icons faked their cut-out lines with opaque `paper2` strokes, which stopped matching the bar once it became translucent glass.

## Details
`PageIcon` and `PersonIcon` take a `paper` prop and draw it as a stroke colour over the filled glyph, faking a knockout against the bar's surface. That was exact while the bar was solid `c.paper2`.

Once the bar became `paper2` at ~66% (light) / ~69% (dark) over a blur, those strokes painted as solid `#EDE6D8` while everything around them was translucent. On a static paper background the mismatch was nearly invisible; it showed when list content scrolled underneath the bar, because the strokes stayed flat while the surface behind them moved and blurred. Only Today and Profile were affected — `CalendarIcon` and `SearchIcon` ignore the `paper` prop entirely and just recolour, so the active treatment was inconsistent across the tabs as well as wrong against the glass.

Fixed by the tab-bar redesign rather than by either option originally proposed (a real SVG cut-out, or a solid plate behind the active icon). The fake knockout is gone entirely: the `if (paper)` branches were deleted from `PageIcon` and `PersonIcon`, which now take plain `Props`, and nothing anywhere in `src/` passes `paper=`. `Item` in `src/components/TabBar.tsx` renders `<Icon color={c.ink} />` inside an `Animated.View` whose opacity ramps 0.78 to 1, while the label carries an `interpolateColor` from `c.ink2` to `c.ink`, both on `duration.ui`, with the sliding indicator behind the active slot doing the rest. Nothing paints an opaque colour over the blur, so there is no surface left to mismatch, and all four bar items get the same treatment.

`TrayIcon`, the third icon in the original five-tab set, was deleted outright with the Inbox tab, and its SVG body was reused for the new `CloseIcon`.

Worth noting what the fix did not do: it removed the condition rather than solving the knockout. If an elevated opaque element over glass is ever wanted again, the same mismatch returns and the SVG mask is still the right answer. See [[Glass Tab Bar]] and [[Pen FAB]].

## Related
- Page: [[Main Tabs]], [[Profile]], [[Today]]
- Feature: [[Glass Tab Bar]], [[Pen FAB]]
