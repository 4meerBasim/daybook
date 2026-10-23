# Notes

Route: `Notes` (native stack)
Summary: Every note, newest touched first, with a row that creates one.

## Related
- Connects to: [[Settings]] — the Notes row opens this screen, [[Profile]] — the same row, [[Note]] — tapping a note opens it, and creating one goes straight there
- Features: [[Notes With Live Task Lines]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Shared Page Link]]

## Notes
`src/screens/NotesScreen.tsx`. Reads the `notes` slice. Creating a note reuses `NameSheet` for the title, then navigates into the new note rather than returning to the list.
