# Profile

Route: `Main` → tab key `profile`
Summary: The account page — an initial avatar with name and member-since line, today's completed count, the habit streak, and rows that open the Studio project and Settings.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap the Projects row, which opens Studio with no list filter, [[Settings]] — tap the Settings row, [[Quick Add Sheet]] — pen FAB
- Features: [[Project Grouped Tasks]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/ProfileScreen.tsx`. The name, member-since line and streak of 12 are fixed content from `src/i18n/strings.ts` — the streak does not move with the sessions recorded by [[Habit Session Timer]]; the done-today count is live, counting the `today` tasks from `useTasks()` that are not flagged `later` and are in the `done` map in `src/state/store.tsx` — `useTasks()` already leaves out anything `cleared`, and includes tasks added from [[Quick Add Sheet]]. The header is a static `PageHeader` — no collapse, since the page is short. This tab took the slot of the removed Search tab; search now lives on the list pages as [[Inline Page Search]].
