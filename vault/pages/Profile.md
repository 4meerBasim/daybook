# Profile

Route: `Main` → tab key `profile`
Summary: The account page — an initial avatar with name and member-since line, today's completed count, the habit streak, and rows that open the Studio project and Settings.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap the Projects row, [[Settings]] — tap the Settings row, [[Quick Add Sheet]] — pen FAB
- Features: [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/ProfileScreen.tsx`. The name, member-since line and streak of 12 are fixed content from `src/i18n/strings.ts`; the done-today count is live, counting tasks from `tasks()` that are in the `done` map and not `cleared` in `src/state/store.tsx`. The header is a static `PageHeader` — no collapse, since the page is short. This tab took the slot of the removed Search tab; search now lives on the list pages as [[Inline Page Search]].
