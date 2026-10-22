# Lift The Ink

Status: planned
Summary: A brief affordance after striking, scratching out or carrying a row that reverses the action exactly — the one recovery path the swipe gestures currently lack.

## Notes
Swipe actions are inherently mis-triggerable, and three of them now commit without any way back. The gap is sharpest on [[Upcoming]]: `selectUpcoming` filters `completedAt IS NULL`, so a ticked row leaves the list immediately and cannot be un-ticked from that screen at all — see [[Swipe Actions Not Wired Into Task Lists]]. [[Calendar]] is the accidental recovery route today, because `selectMonth` does not filter completed rows, but only for a task inside the current month.

The data layer is already shaped for this. Completion is `completedAt` and delete is a soft `deletedAt`, so both are reversible writes; `restore(id)` exists on the store and has never had a caller. Nothing needs a schema change.

What it needs is the surface, and the paper metaphor decides what that is: not a Material snackbar but a thin slip sliding up from the page edge — "struck — lift the ink?" — with the reversal lifting the stroke off the text rather than fading it. Under [[Reduced Motion Mode]] the line just disappears. It has to clear [[Glass Tab Bar]]'s footprint and be at least 44pt tall.

Open decisions:

- How long the slip stays, and whether a second action replaces the first or queues behind it.
- Whether carrying a row forward is undoable on the same affordance once [[Closing the Page Ritual]] exists, which is a different shape of reversal — it moves a row between pages rather than flipping a column.
- Whether delete should also be reachable later from somewhere permanent, since a soft delete is currently invisible once the slip is gone.

## Related
- Page: [[Today]], [[Upcoming]], [[Unfiled]], [[Project Detail]], [[Calendar]], [[Swipe States]]
- Features: [[Swipe Row Actions]], [[Ink Strike-Through Completion]], [[Offline First Local Store]], [[Reduced Motion Mode]], [[Glass Tab Bar]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Closing the Page Ritual]]
