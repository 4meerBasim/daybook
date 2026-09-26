# Inbox

Route: `Main` → tab key `inbox`
Summary: Undated captures waiting to be triaged, each row offering a "Today" or "Someday" chip and a long-press that files it into a project.

## Related
- Connects to: [[Main Tabs]], [[Inbox Empty]] — long-press the Inbox tab, [[Quick Add Sheet]] — pen FAB, [[Project Picker]] — long-press a row
- Features: [[Offline First Local Store]], [[Projects As A Real Entity]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: [[Inbox Triage Chips]], [[Ink Decay and Task Retirement]], [[Waiting On Follow-Ups]], [[Voice Brain Dump Capture]], [[System Capture Entry Points]]

## Notes
`src/screens/InboxScreen.tsx`, reading the `inbox` snapshot from [[Offline First Local Store]] — every task with no due date and no project that is neither completed nor soft-deleted. Rows are keyed by their real id now rather than by title, and the count in the header derives from the list instead of being the literal string `3`, so anything [[Natural Language Quick Add]] parses without a date lands here and the count moves with it. A capture written with hashtags arrives with a clean title, because the tags are a column now — see [[Projects As A Real Entity]].

Long-pressing a row opens [[Project Picker]]; picking a project sets `projectId` and the row leaves this list. The press target is the whole row, as the mock insists ("the whole row toggles, not the 22px box"), so the row is its own `Pressable` with the ruling unit rather than a `LedgerRow`. It also carries an `assign` accessibility action, which is the rotor's "Move" from the mock's a11y notes; the other three rotor actions belong to [[Swipe Row Actions]] and are not wired on this page yet.

The triage chips are still static, exactly as the design draws them — see [[Inbox Triage Chips]] for what is left to decide. They were left as inert 28pt views rather than being wrapped in a 44pt band: the mock's 44px is hit slop, not layout, and a 44pt box inside a row would push its content past the ruling unit and double every row's height. The row long-press covers that area in the meantime. The `Someday · 4` section label is still literal, because nothing in the schema marks a task as someday yet.

A capture is the user's own words and the chips eat most of the row's width, so this is the list where wrapping shows up first: the row takes a second ruling unit and the chips stay centred on it. See [[Ledger Paper Chrome]].
