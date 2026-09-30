# Ink Strike-Through Completion

Status: shipped
Summary: Checking a task draws a pen stroke left-to-right across its title and lets the text fade as if the ink were drying.

## Details
`src/components/TaskRow.tsx`. Two Reanimated shared values drive it:

- `strike` animates a 1.5pt bar from zero to the measured title width (`onLayout` captures `textWidth`), over `duration.stroke` (420ms) with `easing.ink`. Un-checking runs the same animation back in 240ms.
- `dry` runs longer — `duration.dry` (900ms) — and `interpolateColor`s the title from `c.ink` to `c.ink3`, so the stroke lands first and the text greys out behind it.

The bar is absolutely positioned at `top: 11` and anchored to `left: -2` or `right: -2` depending on `rtl`, so the stroke starts from the correct edge in Arabic. A medium impact haptic fires on completion only, not on un-completion. Under [[Reduced Motion Mode]] both values are assigned instantly with no timing.

Completion state itself is the `done` map in `src/state/store.tsx`, keyed by task id.

Static end-state renderings of the same stroke appear elsewhere: `ProjectScreen.tsx` draws the bar at full width for finished rows, and [[Page Closed]] and the subtasks on [[Task Detail]] use plain `textDecorationLine: 'line-through'`.

That split is the design's, not an inconsistency to tidy away. Only the [[Today]] rows animate the stroke, and only those are given the absolutely positioned bar with a transitioning width; every other screen in the design uses `text-decoration: line-through` directly, because the row arrives already struck and has nothing to animate.

## Related
- Page: [[Today]], [[Project Detail]], [[Page Closed]], [[Task Detail]]
- Features: [[Reduced Motion Mode]], [[Ledger Paper Chrome]]
- Bugs: none
