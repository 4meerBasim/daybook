# Eisenhower matrix

Status: shipped
Summary: A 2x2 urgent/important drag grid that sets each task's priority and urgency flags.

## Details
Screen in `src/screens/EisenhowerScreen.tsx`: a 2x2 grid keyed by (important, urgent) — Do first / Schedule / Delegate / Eliminate. Tasks come from `useTasks()` (done/cleared excluded) and land in the quadrant their `important`/`urgent` booleans imply (both falsy → Eliminate). Drag uses react-native-gesture-handler Pan (`activateAfterLongPress`) + Reanimated, lifting a floating overlay that follows the finger; on drop the pointer is hit-tested against each quadrant's measured frame and the move is committed via `scheduleOnRN`. Flags are persisted through `setEisenhower` in `src/state/store.tsx`. A screen-reader fallback exposes one `accessibilityAction` per other quadrant on every card. RTL-mirrored columns, light/dark, reduced-motion aware. The navigator now registers the route and an entry point on [[Profile]].

## Related
- Page: [[Eisenhower Matrix]], [[Today]], [[Recent]]
- Features: [[Smart lists]]
