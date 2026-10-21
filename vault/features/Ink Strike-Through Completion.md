# Ink Strike-Through Completion

Status: shipped
Summary: Checking a task draws a pen stroke left-to-right across its title and lets the text fade as if the ink were drying.

## Details
`src/components/TaskRow.tsx`. Two Reanimated shared values drive it:

- `strike` animates a 1.5pt bar from zero to the measured title width (`onLayout` captures `textWidth`), over `duration.stroke` (420ms) with `easing.ink`. Un-checking runs the same animation back in 240ms.
- `dry` runs longer — `duration.dry` (900ms) — and `interpolateColor`s the title from `c.ink` to `c.ink3`, so the stroke lands first and the text greys out behind it.

The bar is absolutely positioned at `top: '50%'` of the title box and anchored to `left: -2` or `right: -2` depending on `rtl`, so the stroke starts from the correct edge in Arabic and stays centred on the line at any text size — it used to be a hardcoded 11, which is half of the Latin line height and wrong for the Arabic one. A medium impact haptic fires on completion only, not on un-completion. Under [[Reduced Motion Mode]] both values are assigned instantly with no timing.

The bar only appears while the row is one rule tall. Once a title wraps, [[Ledger Paper Chrome]]'s `useRuling` reports `grown` and the row switches to a plain `textDecorationLine: 'line-through'`, which strikes every line through its actual glyphs. A single bar can only cross the first line, and the line-by-line widths a multi-line stroke would need are not measurable without `onTextLayout`, which react-native-web does not implement. The trade is that a wrapped row's completion is instant rather than drawn; the same trade [[Reduced Motion Mode]] already makes.

The bar's length is wrong in a way that predates all of this — see [[Ink Stroke Spans The Whole Title Column]].

Completion state itself is `completedAt` on the task row in [[Offline First Local Store]], not a map — so a struck row is still struck after a reload. Subtasks carry their own `completedAt` in their own table; see [[Task And Subtask Ids Share One Done Map]] for the shared map this replaced.

Static end-state renderings of the same stroke appear elsewhere: `ProjectScreen.tsx` draws the bar at full width for finished rows, and [[Page Closed]], [[Search Results]] — now an overlay rather than a tab, same markup — and the subtasks on [[Task Detail]] use plain `textDecorationLine: 'line-through'`.

That split is the design's, not an inconsistency to tidy away. Only the [[Today]] rows animate the stroke, and only those are given the absolutely positioned bar with a transitioning width; every other screen in the design uses `text-decoration: line-through` directly, because the row arrives already struck and has nothing to animate.

## Related
- Page: [[Today]], [[Project Detail]], [[Page Closed]], [[Search Results]], [[Task Detail]]
- Features: [[Offline First Local Store]], [[Reduced Motion Mode]], [[Ledger Paper Chrome]]
- Bugs: [[Startup Crash From Mismatched Worklets]], [[Task And Subtask Ids Share One Done Map]], [[Ink Stroke Spans The Whole Title Column]]
- Enhancements: [[Closing the Page Ritual]], [[Ink Decay and Task Retirement]]
