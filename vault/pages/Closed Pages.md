# Closed Pages

Route: `ClosedPages` (native stack)
Summary: The archive — every closed day newest first, with tally marks for what settled and a settled-of-total ratio.

## Related
- Connects to: [[Settings]] — the "Closed pages" row opens this screen, [[Profile]] — the same row appears there, [[Page Closed]] — tapping a day opens that page
- Features: [[Closing the Page Ritual]], [[Calendar Tally Marks]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]

## Notes
`src/screens/ClosedPagesScreen.tsx`. Reads the `closedDays` slice, which the store loads with the rest of the snapshot, so the list is current without its own query. Empty until a page has actually been closed, and says so rather than drawing an empty ledger with no explanation.
