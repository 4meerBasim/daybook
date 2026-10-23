# Page Closed

Route: `PageClosed` (native stack)
Summary: The end-of-day sheet — every task struck through, a wax stamp with a timestamp across them, a closing line, the day's counts, and a "plan tomorrow" button.

## Related
- Connects to: [[Today]] — reached by tapping the wax stamp once nothing is left, [[Main Tabs]] — "Plan tomorrow" calls `navigation.goBack()`, [[Close Page]], [[Closed Pages]]
- Features: [[Wax Page Closed Stamp]], [[Ledger Paper Chrome]], [[Ink Strike-Through Completion]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Day Capacity Budget]], [[Closing the Page Ritual]]
- Bugs: [[Page Header Shows A Frozen Date]], [[Stack Screens Ignore The Bottom Safe Area]] — latent here; nothing on this screen reaches the gesture area yet, [[Stack Screens Reserve Tab Bar Space]], [[Ink Stroke Spans The Whole Title Column]] — not affected; uses `textDecorationLine`
- Enhancements: [[Closing the Page Ritual]] — the decision pass that should run before the stamp lands

## Notes
`src/screens/PageClosedScreen.tsx`. The screen takes a `day` route param and reads that day through `useClosedPage`, so it serves both destinations: the page just stamped by [[Close Page]], and any older page opened from [[Closed Pages]].

Each row is a real `closed_entries` record rendered as a `LedgerRow` at the 66pt content column, with its outcome in the trailing mono label. Settled and struck rows strike through; a carried row stays in full ink, because it is still live work sitting on another page. The rows grow with their text and the rules stay in step. Nothing here toggles — a closed page is history.

The five hardcoded `t.task1`–`t.task5` lines this replaced were drawn whatever the day actually held; see [[Closing the Page Ritual]].

The stamp is rendered at size 26 over the ledger as a non-interactive overlay, captioned with the real `closedAt` through `stamped()` — the larger, timestamped variant of what [[Today]] shows. It is only drawn when a `closed_days` row exists. The italic date line above the page title comes from the `day` param; both used to be literals, see [[Page Header Shows A Frozen Date]].

The closing counts are derived from the entries — settled, carried, moved and struck, each omitted when zero — and when estimates exist the screen also states settled against committed minutes from [[Day Capacity Budget]]. The `5 tasks · 1 habit · streak 13` literal is gone.

"Plan tomorrow" fills tomorrow from the backlog up to the remaining capacity and only navigates away if it placed something; see [[Day Capacity Budget]].
