# Deal

Route: `Deal` (native stack, `presentation: 'fullScreenModal'`)
Summary: One task dealt face up from a filtered deck, with Focus, Done and deal-another underneath it.

## Related
- Connects to: [[Main Tabs]] — opened by long-pressing the Profile tab, closed with the X, [[Focus Mode]] — Focus replaces this screen with the session, [[Profile]]
- Features: [[Deal Me One Task Picker]], [[Focus Timer]], [[Day Capacity Budget]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]], [[Focus Live Activity and Widgets]]

## Notes
`src/screens/DealScreen.tsx`. Rendered on `paper2` like [[Focus Mode]], so the card reads as its own sheet. Context chips are derived from the tags present on the dealable rows, so the list is empty until the user has tagged something.

[[Lift The Ink]] is suppressed here — the screen's only write is completing the dealt card, and the slip would cover the deal button.
