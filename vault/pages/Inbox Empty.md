# Inbox Empty

Route: `InboxEmpty` (native stack)
Summary: The empty state of the inbox — bare ruled paper with an italic "Nothing waiting." and a hint pointing at the pen.

## Related
- Connects to: [[Inbox]] — reached by long-pressing the Inbox tab; returns via the system back gesture, [[Main Tabs]]
- Features: [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/InboxEmptyScreen.tsx`. Drawn as a standalone screen rather than a conditional branch of [[Inbox]], so it is a demo/reference state rather than something the real inbox falls back to when its seed data is empty. The red margin rule and eleven ruled lines are drawn inline here instead of via the shared `Ledger` wrapper.
