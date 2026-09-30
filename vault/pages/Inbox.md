# Inbox

Route: `Main` → tab key `inbox`
Summary: Undated captures waiting to be triaged, each row offering a "Today" or "Someday" chip.

## Related
- Connects to: [[Main Tabs]], [[Inbox Empty]] — long-press the Inbox tab, [[Quick Add Sheet]] — pen FAB
- Features: [[Inline Page Search]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
- Enhancements: [[Inbox Triage Chips]]

## Notes
`src/screens/InboxScreen.tsx`, data from `inbox()` in `src/data/seed.ts`. The triage chips are static, exactly as the design draws them — see [[Inbox Triage Chips]] for why they are not yet interactive. This is the landing spot for anything [[Natural Language Quick Add]] parses without a date.
