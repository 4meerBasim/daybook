# Closing the Page Ritual

Status: planned
Summary: Turn the end of the day into a deliberate act — every unfinished task gets one decision, then the page is stamped and becomes read-only history.

## Notes
The signature idea. Every competing app silently rolls unfinished work forward forever, so the user never feels the accumulating debt. A ledger records what actually happened, so Daybook should refuse to roll anything over without a decision: **carried**, **struck** (abandoned), or **rescheduled**. Each task then carries its carry count in the margin — "carried 4x" — which is the pressure that makes the user either do it or kill it.

[[Page Closed]] already draws the destination: struck lines, the timestamped [[Wax Page Closed Stamp]], the day's counts, a "plan tomorrow" button. What the mock does not draw is the decision pass that should happen before the stamp lands, nor the archive the closed page becomes.

Open decisions:

- [[Today]] can already be cleared by striking or swiping every row, and `leftN === 0` is what reveals the stamp. A real ritual has to handle the opposite case — closing a page with work still on it — which the mock has no state for.
- The struck lines on [[Page Closed]] are a non-interactive overlay over six empty ruled rows, not real task rows. The ritual needs actual rows to act on.
- Carry counts need per-task history, and nothing in `src/state/store.tsx` persists across launches — the `done` and `cleared` maps are in-memory only. Needs [[Offline First Local Store]] first.
- Closed pages have to be readable later, which implies a dated archive route the design does not include.

## Related
- Page: [[Page Closed]], [[Today]], [[Upcoming]]
- Features: [[Wax Page Closed Stamp]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]]
- Enhancements: [[Ink Decay and Task Retirement]], [[Weekly Spread Review]], [[Day Capacity Budget]], [[Offline First Local Store]]
