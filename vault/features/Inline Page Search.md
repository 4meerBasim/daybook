# Inline Page Search

Status: shipped
Summary: Each list tab carries its own search field pinned at the bottom of the page that filters that page's rows as you type, by project name or task title, replacing the old dedicated Search tab.

## Details
`src/components/SearchField.tsx` is the field — a 48pt `paper2` box with the magnifier icon and a `TextInput` whose placeholder and accessibility label are `t.search`. It mirrors with `row(rtl)` and `align(rtl)`.

[[Today]], [[Recent]] and [[Inbox]] each render it after the scroll view, pinned to the bottom of the page just above the pen FAB, and hold the query in local `useState`. The field is absolutely positioned at `metrics.tabBar + 28` from the bottom; the scroll views pad their content by the exported `searchFieldInset` so the last rows clear it. On iOS it listens for the keyboard and lifts to sit 8pt above it; on Android the window resize carries it up with the tab bar. A clear button appears at the end of the field once there is text. Matching is `matches()` in `src/lib/matches.ts` — a substring test that ignores case, Arabic diacritics and tatweel, hamza forms of alef, and the difference between Arabic-Indic and Latin digits. Since [[Project Grouped Tasks]] [[Today]] and [[Inbox]] list projects, so there the query is handed to `ProjectRows`, which keeps a project row when the project's name matches or when any task title inside it (for that page's list) matches. Searching for a task therefore finds the project that holds it; the row's done/total count is not narrowed to the matches, and opening the project shows all of its tasks. A page with no matching rows shows a single "no matches" ruled label:

- [[Today]] filters the project rows and hides the habits section whenever a query is active. The remaining-count label and the wax stamp still read from the unfiltered list, so searching never closes the page.
- [[Recent]] filters its task rows directly: a task stays when its title or its project's name matches, with unassigned tasks matching on "No project".
- [[Inbox]] filters the project rows, including "No project", and hides the Someday label while a query is active. The header count stays at the full inbox total.

The query is per page and resets on tab switch, because `MainTabs` mounts one tab at a time. The scroll views dismiss the keyboard on drag.

This replaced `src/screens/SearchScreen.tsx`, a fourth tab whose result list was fixed mock content that never re-filtered. Its filter chips (All / tasks / notes / Completed), tag result and note excerpt went with it, and its tab slot now holds [[Profile]].

## Related
- Page: [[Today]], [[Recent]], [[Inbox]], [[Main Tabs]]
- Features: [[Project Grouped Tasks]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none
