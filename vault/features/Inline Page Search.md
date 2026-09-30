# Inline Page Search

Status: shipped
Summary: Each list tab carries its own search field under the header that filters that page's rows as you type, replacing the old dedicated Search tab.

## Details
`src/components/SearchField.tsx` is the field — a 48pt `paper2` box with the magnifier icon and a `TextInput` whose placeholder and accessibility label are `t.search`. It mirrors with `row(rtl)` and `align(rtl)`.

[[Today]], [[Upcoming]] and [[Inbox]] each render it directly below the `PageHeader`, inside the scroll view, and hold the query in local `useState`. A clear button appears at the end of the field once there is text. Matching is `matches()` in `src/lib/matches.ts` — a substring test on the row title that ignores case, Arabic diacritics and tatweel, hamza forms of alef, and the difference between Arabic-Indic and Latin digits. A page with no matching rows shows a single "no matches" ruled label:

- [[Today]] filters the task rows and hides the habits section when the habit title does not match. The remaining-count label and the wax stamp still read from the unfiltered list, so searching never closes the page.
- [[Upcoming]] filters inside each day group, drops groups left empty, and shows the matched count in place of the group's count while a query is active.
- [[Inbox]] filters the capture rows, shows the matched count in the header, and hides the Someday label while a query is active.

The query is per page and resets on tab switch, because `MainTabs` mounts one tab at a time. The scroll views dismiss the keyboard on drag.

This replaced `src/screens/SearchScreen.tsx`, a fourth tab whose result list was fixed mock content that never re-filtered. Its filter chips (All / tasks / notes / Completed), tag result and note excerpt went with it, and its tab slot now holds [[Profile]].

## Related
- Page: [[Today]], [[Upcoming]], [[Inbox]], [[Main Tabs]]
- Features: [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none
