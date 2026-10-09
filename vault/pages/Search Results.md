# Search Results

Route: no stack route — a full-bleed overlay rendered inside `MainTabs`, opened by the `searching` flag
Summary: All / tasks / notes / Completed filter chips over grouped results — matching tasks with the term highlighted, a tag, and a note excerpt — fading in over whichever pane is showing.

## Related
- Connects to: [[Main Tabs]] — opened by the search button in the tab bar and closed by its X, [[Project Detail]] — tap the `#invoice` tag result, [[Today]], [[Upcoming]], [[Profile]] — the panes it covers
- Features: [[Expanding Search Field]], [[Glass Tab Bar]], [[Animated Page Transitions]], [[Ledger Paper Chrome]], [[Projects As A Real Entity]], [[Ink Strike-Through Completion]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Stack Screens Reserve Tab Bar Space]] — the same footprint hook, used correctly here
- Enhancements: [[Notes With Live Task Lines]]

## Notes
`src/screens/SearchResults.tsx`. This was a tab pane in `src/screens/SearchScreen.tsx` with its own `search` key in `TabKey`; it is now an overlay with no route and no tab. It is absolutely positioned to all four edges over the pane strip, filled `c.paper` so the pane underneath is hidden rather than blended, and `pointerEvents` is `none` until `visible`.

It animates off the same `searchProgress` value the bar's button grows on: opacity straight from the progress plus a `translateY` from 16 to 0, so the results rise slightly as the field finishes opening — see [[Expanding Search Field]]. Under [[Reduced Motion Mode]] the progress is assigned, so it appears already in place.

The query lives on [[Main Tabs]], not here. This component takes only `progress`, `visible` and `onOpenProject`; the text field is in the tab bar. Filter selection is still real local state, and the result set below is still fixed content from `src/i18n/strings.ts` that does not re-filter — the query is not wired to anything.

There is no [[Collapsing Page Header]] on this surface. The old pane had one; the overlay starts with the filter chip row at `useHeaderTop()` instead, because the field that would carry the title is down in the bar. It reserves `useTabBarFootprint()` at the bottom like the three real panes do.

The tag result opens [[Project Detail]] with the seeded `projectId`, which keeps that path behaving exactly as it did as a tab. It is a fixed target rather than a lookup, so deleting the seeded project leaves this row pointing at nothing; see [[Projects As A Real Entity]].

The two task results and the note excerpt are `LedgerRow`s, so they grow rather than truncate — the note row passes `start={metrics.content}` because it has no checkbox and begins at the 66pt column. The section headers and the tag row are chrome and stay one rule tall. The completed result uses a plain `textDecorationLine: 'line-through'`, not the animated stroke. The tag result uses the shared `Chip`; the filter chips are still bespoke, since they carry a selected state, and they took an explicit `lineHeight` so a long label truncates inside the pill.
