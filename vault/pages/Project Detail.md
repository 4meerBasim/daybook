# Project Detail

Route: `Project` (native stack)
Summary: The Studio project page — a 7/12 progress count, shared avatars, tag chips, and the project's tasks split into "this week" and "later".

## Related
- Connects to: [[Search]] — reached by tapping the `#invoice` tag result; returns via the system back gesture, [[Main Tabs]], [[Task Detail]]
- Features: [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/ProjectScreen.tsx`, rows from `project()` in `src/data/seed.ts`. Completed rows draw the ink stroke statically at the measured text width rather than animating it — same visual as [[Ink Strike-Through Completion]] at its end state. The first unfinished row is the same task that [[Task Detail]] expands.
