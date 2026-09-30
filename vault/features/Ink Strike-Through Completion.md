# Ink Strike-Through Completion

Status: shipped
Summary: Checking a task draws a pen stroke left-to-right across its title and lets the text fade as if the ink were drying.

## Details
`src/components/TaskRow.tsx`. Two Reanimated shared values drive it:

- `strike` animates a 1.5pt bar from zero to the measured title width (`onLayout` captures `textWidth`), over `duration.stroke` (420ms) with `easing.ink`. Un-checking runs the same animation back in 240ms.
- `dry` runs longer — `duration.dry` (900ms) — and `interpolateColor`s the title from `c.ink` to `c.ink3`, so the stroke lands first and the text greys out behind it.

The bar is absolutely positioned at `top: 11` and anchored to `left: -2` or `right: -2` depending on `rtl`, so the stroke starts from the correct edge in Arabic. A medium impact haptic fires on completion only, not on un-completion. Under [[Reduced Motion Mode]] both values are assigned instantly with no timing.

Completion state itself is the `done` map in `src/state/store.tsx`, keyed by task id.

The animated rows are on [[Project Detail]]. `ProjectScreen.tsx` used to draw its own static full-width bar for finished rows; it now renders `TaskRow`, so it is the one place the stroke animates. [[Today]] no longer renders task rows at all since [[Project Grouped Tasks]] — it shows the result only as the done/total count on each project row and in the header tally.

Static end-state renderings remain on [[Page Closed]] and the subtasks on [[Task Detail]], which use plain `textDecorationLine: 'line-through'`. That split is the design's, not an inconsistency to tidy away: those rows arrive already struck or toggle without ceremony, and have nothing to animate.

## Related
- Page: [[Project Detail]], [[Page Closed]], [[Task Detail]]
- Features: [[Project Grouped Tasks]], [[Swipe Row Actions]], [[Wax Page Closed Stamp]], [[Reduced Motion Mode]], [[Ledger Paper Chrome]]
- Bugs: none
