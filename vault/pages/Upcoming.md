# Upcoming

Route: `Main` → tab key `upcoming`
Summary: Scheduled work grouped by day — tomorrow, a named weekday, and next week — each group headed by an italic display date and a count.

## Related
- Connects to: [[Main Tabs]], [[Calendar]] — long-press the Upcoming tab, [[Quick Add Sheet]] — pen FAB
- Features: [[Inline Page Search]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: none

## Notes
`src/screens/UpcomingScreen.tsx`, data from `upcoming()` in `src/data/seed.ts`. Rows here are read-only `LedgerRow`s — the checkboxes are static, unlike [[Today]].
