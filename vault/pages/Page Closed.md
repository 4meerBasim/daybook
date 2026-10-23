# Page Closed

Route: `PageClosed` (native stack)
Summary: The end-of-day sheet — every task struck through, a wax stamp with a timestamp across them, a closing line, the day's counts, and a "plan tomorrow" button.

## Related
- Connects to: [[Today]] — reached by tapping the wax stamp once nothing is left, [[Main Tabs]] — "Plan tomorrow" calls `navigation.goBack()`
- Features: [[Wax Page Closed Stamp]], [[Ledger Paper Chrome]], [[Ink Strike-Through Completion]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Day Capacity Budget]]
- Bugs: [[Page Header Shows A Frozen Date]], [[Stack Screens Ignore The Bottom Safe Area]] — latent here; nothing on this screen reaches the gesture area yet, [[Stack Screens Reserve Tab Bar Space]], [[Ink Stroke Spans The Whole Title Column]] — not affected; uses `textDecorationLine`
- Enhancements: [[Closing the Page Ritual]] — the decision pass that should run before the stamp lands

## Notes
`src/screens/PageClosedScreen.tsx`. The struck lines are five `LedgerRow`s starting at the 66pt content column, followed by one `EmptyRules` line — six ruled rows in total, as before. They used to be an absolutely positioned overlay on top of six empty rules, which only worked while every line was guaranteed to be exactly one rule tall; as real rows they grow with their text and the rules stay in step. They are still non-interactive: nothing on this screen toggles.

The stamp is rendered at size 26 over them as a non-interactive overlay, with a real date/time caption from `stamped()` — the larger, timestamped variant of what [[Today]] shows. The italic date line above the page title is real too; both used to be literals, see [[Page Header Shows A Frozen Date]].

The ledger takes its height from those six rows instead of the design's literal `336px`. React Native's box model is always border-box, so a declared `336` would have included the ledger's own 1px top rule and left the sixth row a pixel short; six rows of 56 come to 336 on their own and the top rule sits above them, which is what the design's content-box `336px` plus `border-top` actually measures.

The closing counts — `5 tasks · 1 habit · streak 13` — are still the mock's literals, since nothing tallies a closed day yet. [[Closing the Page Ritual]] is where that lands.
