# Projects

Route: `Projects` (native stack)
Summary: A ruled ledger of every live project — colour dot, name, completed / total fraction — plus a row for making a new one.

## Related
- Connects to: [[Settings]], [[Profile]] — reached from the Projects row on either; returns via the system back gesture, [[Project Detail]] — tap a project row, [[Main Tabs]]
- Features: [[Projects As A Real Entity]], [[Offline First Local Store]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Reduced Motion Mode]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]] — archiving a project is one of its two sources, [[Stack Screens Ignore The Bottom Safe Area]], [[Stack Screens Reserve Tab Bar Space]] — the gutter padding this screen already got right
- Enhancements: [[Shared Page Link]]

## Notes
`src/screens/ProjectsScreen.tsx`. The mock draws no projects screen — the only traces of one are the `2 shared projects` value in the preferences rows [[Settings]] and [[Profile]] share, and a deferred line about a desktop two-column layout with a project sidebar. So this is designed rather than copied, and it is deliberately the same paper as every other list: rows sit on the ruling unit, the vermilion margin line runs at 52, the colour dot sits centred in the 22pt checkbox column so names start at the same 66pt as every task title, and the fraction is mono at the trailing edge with the completed count in ink and the total in ink-3. No cards, no tiles, no new surface.

The fractions come from the `assigned` snapshot — every non-deleted task that has a `projectId` — filtered per project, which is the same array [[Project Detail]] reads. One query feeds both screens.

Tap a row to open it. Long-press a row for the management sheet: the project's name, then `Rename` and `Delete project` in vermilion. Delete asks first, and says what happens to the tasks before it happens. Rename and create share one naming sheet — an ink-underlined field over a secondary Cancel and a primary Save, the sheet chrome the mock specifies for the quick-add sheet. The sheets are a plain `Modal` in `src/components/Sheet.tsx` rather than `@gorhom/bottom-sheet`, which keeps text input in a sheet away from [[Bottom Sheet Text Input Crashes On Web]].

Long-press is not the only way in: the row carries a `manage` accessibility action, so the rotor reaches the same sheet.
