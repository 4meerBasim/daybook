# Profile

Route: `Main` → tab key `profile`
Summary: The account page — an initial avatar with name and member-since line, today's completed count, the habit streak, and rows that open the Studio project and Settings.

## Related
- Connects to: [[Main Tabs]], [[Project Detail]] — tap the Projects row, which opens Studio with no list filter, [[Settings]] — tap the Settings row, [[Journals]] — tap the Journals row, [[Search]] — the Search row, [[Quick Add Sheet]] — pen FAB, [[Smart Lists]] — the Smart lists row, [[Tag Browser]] — the Tag browser row, [[Eisenhower Matrix]] — the Eisenhower matrix row
- Features: [[Project Grouped Tasks]], [[Journaling streak + nudge]], [[Multiple journals]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Global search]], [[Focus stats]], [[Karma and gamification]], [[Export JSON and Markdown]], [[Cloud sync (Supabase)]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/ProfileScreen.tsx`. The name, member-since line and streak of 12 are fixed content from `src/i18n/strings.ts` — the streak does not move with the sessions recorded by [[Habit Session Timer]]; the done-today count is live, counting the `today` tasks from `useTasks()` that are not flagged `later` and are in the `done` map in `src/state/store.tsx` — `useTasks()` already leaves out anything `cleared`, and includes tasks added from [[Quick Add Sheet]]. The header is a static `PageHeader` — no collapse, since the page is short. Phase 6 added three live stat rows and a link row: a [[Karma and gamification]] row (level name, level number and points from `useKarma()`), a [[Focus stats]] "Focus time" total and a "Focus sessions" count with a this-week figure (from `useFocusStats()`), and a Search row that opens the global [[Search]] screen via `onOpenSearch`. Per-page search still lives on the list pages as [[Inline Page Search]].
