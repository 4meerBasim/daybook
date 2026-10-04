# Color labels

Status: shipped
Summary: Tag tasks with an optional colour label for at-a-glance grouping.

## Details
`src/components/ColorLabelPicker.tsx` applies an optional colour on [[Task Detail]], drawn from the shared `LABEL_COLORS` palette in `src/theme/tokens.ts`. The colour is stored through `setColor` in `src/state/store.tsx` and surfaced on task rows by `src/components/TaskRow.tsx`, so labelled tasks read at a glance on [[Project Detail]] rows.

## Related
- Page: [[Task Detail]], [[Project Detail]]
