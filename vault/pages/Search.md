# Search

Route: `Search` (native stack)
Summary: A global search over tasks, projects and journal entries, with an autofocused query field and results grouped by type.

## Related
- Connects to: [[Profile]] — reached from the Search row; returns via the back gesture, [[Main Tabs]], [[Task Detail]] — tapping a task result, [[Project Detail]] — tapping a project result, [[Entry Composer]] — tapping an entry result
- Features: [[Global search]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/SearchScreen.tsx`, registered on the root native stack and reached via `onOpenSearch` from `MainTabs`. The query is matched case-insensitively against task title / meta / description / tags, project names, and entry title / body; results render under localized section labels (`searchTasks`, `searchProjects`, `searchEntries`). Tasks reuse `TaskRow` inside a `Ledger`; projects and entries use a simple ruled `ResultRow`. An empty query shows `searchHint`; no matches shows `noResults`. RTL-safe and themed.
