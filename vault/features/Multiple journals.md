# Multiple journals

Status: shipped
Summary: Keep more than one journal so entries can be split across separate books.

## Details
Journals (name, colour, icon) live in the `journals` table (`src/lib/db.ts`); a default journal (`DEFAULT_JOURNAL_ID`, from `defaultJournal(t)` in `src/data/seed.ts`) always exists and cannot be deleted. They are managed on [[Journals]] (`src/screens/JournalsScreen.tsx`) — add, rename, recolour, re-icon, delete, and set the current journal — reached from [[Profile]]. [[Today]] shows a horizontal journal switcher (one chip per `useJournals()`, highlighting `currentJournalId`, calling `setCurrentJournal`); the daily-note card and [[Entry Composer]] scope their entry to `currentJournalId`, and [[Timeline and map view]] colours each entry by its journal.

## Related
- Page: [[Today]], [[Profile]], [[Journals]], [[Entry Composer]], [[Timeline and Map]]
- Features: [[Daily note]], [[Persistence layer]], [[Timeline and map view]]
