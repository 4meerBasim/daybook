# Global search

Status: shipped
Summary: A top-level search spanning tasks, projects and journal entries, reached from the Profile tab.

## Details
`src/screens/SearchScreen.tsx`, registered as the `Search` route in `src/navigation/Root.tsx` and reached from the Search row on [[Profile]] (wired through `MainTabs` as `onOpenSearch`). An autofocused query field filters live across `useTasks()` (title, meta, description and tags), `useProjects()` (name) and journal entries from the store (title and body). Results are grouped under localized section labels — Tasks (rendered as `TaskRow` inside a `Ledger`), Projects and Entries. Tapping a result navigates: task → [[Task Detail]], project → [[Project Detail]], entry → [[Entry Composer]] (`{ entryId }`). Empty-query and no-results states are localized (`searchHint`, `noResults`), and the screen is RTL-safe and themed. Matching is case-insensitive substring over the normalized fields.

## Related
- Page: [[Search]], [[Profile]], [[Main Tabs]], [[Today]], [[Inbox]], [[Recent]], [[Task Detail]], [[Project Detail]], [[Entry Composer]]
- Features: [[Inline Page Search]], [[Smart lists]]
