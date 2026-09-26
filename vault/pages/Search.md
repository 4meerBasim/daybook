# Search

Route: `Main` → tab key `search`
Summary: A query field with All / tasks / notes / Completed filter chips over grouped results — matching tasks with the term highlighted, a tag, and a note excerpt.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap the `#invoice` tag result, [[Quick Add Sheet]] — pen FAB
- Features: [[Ledger Paper Chrome]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: none found
- Enhancements: [[Notes With Live Task Lines]]

## Notes
`src/screens/SearchScreen.tsx`. The query and filter selection are real local state; the result set below is fixed content from `src/i18n/strings.ts` and does not re-filter. The completed result uses a plain `textDecorationLine: 'line-through'`, not the animated stroke.

The two task results and the note excerpt are `LedgerRow`s, so they grow rather than truncate — the note row passes `start={metrics.content}` because it has no checkbox and begins at the 66pt column. The section headers and the tag row are chrome and stay one rule tall. The tag result uses the shared `Chip`; the filter chips are still bespoke, since they carry a selected state, and they took an explicit `lineHeight` so a long label truncates inside the pill.
