# Search

Route: `Main` → tab key `search`
Summary: A query field with All / tasks / notes / Completed filter chips over grouped results — matching tasks with the term highlighted, a tag, and a note excerpt.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap the `#invoice` tag result, [[Quick Add Sheet]] — pen FAB
- Features: [[Ledger Paper Chrome]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/SearchScreen.tsx`. The query and filter selection are real local state; the result set below is fixed content from `src/i18n/strings.ts` and does not re-filter. The completed result uses a plain `textDecorationLine: 'line-through'`, not the animated stroke.
