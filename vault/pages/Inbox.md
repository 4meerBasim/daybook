# Inbox

Route: `Main` → tab key `inbox`
Summary: Undated captures waiting to be triaged, each row offering a "Today" or "Someday" chip.

## Related
- Connects to: [[Main Tabs]], [[Inbox Empty]] — long-press the Inbox tab, [[Quick Add Sheet]] — pen FAB
- Features: [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: none

## Notes
`src/screens/InboxScreen.tsx`, data from `inbox()` in `src/data/seed.ts`. The triage chips are `Pressable`s with accessibility labels but no handlers yet — they render the affordance without moving the row. This is the landing spot for anything [[Natural Language Quick Add]] parses without a date.
