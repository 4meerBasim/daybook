# Journals

Route: `Journals` (native stack, `src/screens/JournalsScreen.tsx`)
Summary: Manage multiple journals — add, rename, recolour and re-icon them, set the current journal, and delete any journal except the default, which always exists and cannot be removed.

## Related
- Connects to: [[Profile]] — reached from the Journals row; the back chevron returns there
- Features: [[Multiple journals]]
- Bugs:
- Enhancements:

## Notes
`src/screens/JournalsScreen.tsx`. Lists `useJournals()` — each row shows the journal's icon in its colour, its name, and a check on `currentJournalId`; tapping a row calls `setCurrentJournal`. A pen/add affordance creates a journal (`addJournal`), and the inline editor sets name, a colour from `blue` / `och` / `moss` / `ver`, and an icon from `JOURNAL_ICON_KEYS` (`updateJournal`). Delete is a two-step confirm (`removeJournal`) and is hidden for the default journal (`DEFAULT_JOURNAL_ID`). RTL-aware via `src/lib/rtl.ts`; all copy from i18n.
