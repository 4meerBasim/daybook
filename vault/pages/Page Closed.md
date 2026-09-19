# Page Closed

Route: `PageClosed` (native stack)
Summary: The end-of-day sheet — every task struck through, a wax stamp with a timestamp across them, a closing line, the day's counts, and a "plan tomorrow" button.

## Related
- Connects to: [[Today]] — reached by tapping the wax stamp once nothing is left, [[Main Tabs]] — "Plan tomorrow" calls `navigation.goBack()`
- Features: [[Wax Page Closed Stamp]], [[Ledger Paper Chrome]], [[Ink Strike-Through Completion]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/PageClosedScreen.tsx`. The struck lines are a non-interactive overlay drawn on top of six empty ruled rows rather than real task rows, and the stamp is rendered at size 26 with the date/time caption — the larger, timestamped variant of what [[Today]] shows.

The ledger takes its height from those six rows instead of the design's literal `336px`. React Native's box model is always border-box, so a declared `336` would have included the ledger's own 1px top rule and left the sixth row a pixel short; six rows of 56 come to 336 on their own and the top rule sits above them, which is what the design's content-box `336px` plus `border-top` actually measures.
