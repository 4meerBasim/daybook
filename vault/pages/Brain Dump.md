# Brain Dump

Route: `BrainDump` (native stack)
Summary: One field for everything at once, a recorder beside it, then a reviewable list of parsed tasks before anything is written.

## Related
- Connects to: [[Main Tabs]] — opened by long-pressing the Add item in the bar, [[Note]] — committing replaces this screen with the note it created, [[Unfiled]] — undated items land there
- Features: [[Voice Brain Dump Capture]], [[Natural Language Quick Add]], [[Notes With Live Task Lines]], [[Day Capacity Budget]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]]

## Notes
`src/screens/BrainDumpScreen.tsx`. Two states in one screen: the dump field, then the review ledger. Nothing is written until the review is committed, so backing out at any point leaves the database untouched.

Dictation is the system keyboard's microphone rather than an in-app transcriber — see [[Voice Brain Dump Capture]] for why. The recorder stores the clip as the record of what was said and attaches it to the created note.
