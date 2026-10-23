# Close Page

Route: `ClosePage` (native stack)
Summary: The decision pass — every row left on today's page with Carry / Strike / Move, and a stamp button that stays disabled until each one is decided.

## Related
- Connects to: [[Today]] — the "Close the page" ledger row and the stamp both open this screen, [[Page Closed]] — stamping replaces this screen with the closed page, [[Main Tabs]] — the back chevron returns without closing
- Features: [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]

## Notes
`src/screens/ClosePageScreen.tsx`. Decisions are held in local state keyed by task id and committed in one transaction when the page is stamped, so backing out of the screen writes nothing. A row carrying a previous count shows `carried 4×` under its title in ochre.

Move opens the shared `Sheet` with two dated options rather than a picker. The outcome buttons are `accessibilityRole="radio"` with `selected` state, since exactly one outcome applies per row.

[[Lift The Ink]] is suppressed here — the screen writes nothing until the stamp, so there is nothing to lift.
