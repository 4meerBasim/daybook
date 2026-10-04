# Daily note

Status: shipped
Summary: A single dated page per day that gathers the day's writing in one place.

## Details
Each day has one entry per journal, keyed by `dayKey` (`src/lib/day.ts`). On [[Today]] (`src/screens/TodayScreen.tsx`) the daily-note card reads the current journal's entry where `journalId === currentJournalId && day === dayKey(new Date())` from `useStore().entries`; tapping it opens the full-screen [[Entry Composer]] (`src/screens/EntryComposerScreen.tsx`) with that entry id, or with `null` to start today's note. Entries persist to the `entries` table in `src/lib/db.ts`.

## Related
- Page: [[Today]], [[Entry Composer]]
- Features: [[Daily writing prompts]], [[Multiple journals]], [[Persistence layer]]
