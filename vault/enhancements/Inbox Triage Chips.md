# Inbox Triage Chips

Status: planned
Summary: Make the "Today" and "Someday" chips on each inbox row actually move the capture out of the inbox.

## Notes
The design calls these "two one-tap triage chips (Today / Someday); long-press for a project", but its own render wires no handler to them — they are static `div`s, unlike the Today rows, which do carry an `onClick` toggle. So the chips ship as drawn-but-inert, matching the mock exactly.

They were briefly `Pressable`s with accessibility labels and no `onPress`. That is worse than static: TalkBack and VoiceOver announce a button that does nothing. They are now plain [[Ledger Paper Chrome]] chips again.

The data blockers are gone. [[Offline First Local Store]] gave both pages the same task table, so [[Today]] and [[Inbox]] are two filters over one set of rows with stable ids, and "send to Today" is now just `edit(id, { dueDate })`. The inbox header count derives from the list rather than being the literal string `3`.

What is left is a product decision plus one dependency:

- "Someday" still has nothing behind it. The `Someday · 4` section label is still literal, because no column marks a task as someday — a nullable field, a far-future due date, and a separate list are three different products. The same gap [[Ink Decay and Task Retirement]] runs into for its retirement prompt.
- Making the chips interactive means deciding what feedback a triaged row gets as it leaves the list, which the mock does not draw.

The long-press-for-a-project half is done, and it did not need `zeego`. That claim was wrong: the design's tech notes name `zeego` for a native context menu, but the picker is a sheet, not a menu, so a plain `Pressable` with `onLongPress` on the row and a `Modal` sheet covered it with no new dependency — see [[Project Picker]] and [[Projects As A Real Entity]]. This note stays `planned` because the Today / Someday chips themselves are still inert.

Wiring the chips will not fight the long-press: they are inert views inside the row's own `Pressable`, and the mock's "28px visual inside a 44px hit slop" is hit slop, which a chip gets when it becomes pressable without changing the row's layout height.

## Related
- Page: [[Inbox]], [[Today]], [[Project Picker]]
- Features: [[Offline First Local Store]], [[Projects As A Real Entity]], [[Ledger Paper Chrome]], [[Natural Language Quick Add]]
- Enhancements: [[Ink Decay and Task Retirement]]
