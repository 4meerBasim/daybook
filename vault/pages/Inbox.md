# Inbox

Route: `Main` → tab key `inbox`
Summary: Undated captures waiting to be triaged, each row offering a "Today" or "Someday" chip.

## Related
- Connects to: [[Main Tabs]], [[Inbox Empty]] — long-press the Inbox tab, [[Quick Add Sheet]] — pen FAB
- Features: [[Offline First Local Store]], [[Ledger Paper Chrome]], [[Collapsing Page Header]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]], [[Quick Add Does Not Create Tasks]]
- Enhancements: [[Inbox Triage Chips]], [[Ink Decay and Task Retirement]], [[Waiting On Follow-Ups]], [[Voice Brain Dump Capture]], [[System Capture Entry Points]]

## Notes
`src/screens/InboxScreen.tsx`, reading the `inbox` snapshot from [[Offline First Local Store]] — every task with no due date and no project that is neither completed nor soft-deleted. Rows are keyed by their real id now rather than by title, and the count in the header derives from the list instead of being the literal string `3`, so anything [[Natural Language Quick Add]] parses without a date lands here and the count moves with it.

The triage chips are still static, exactly as the design draws them — see [[Inbox Triage Chips]] for what is left to decide. The `Someday · 4` section label is still literal, because nothing in the schema marks a task as someday yet.
