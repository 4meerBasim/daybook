# Inbox Triage Chips

Status: planned
Summary: Make the "Today" and "Someday" chips on each inbox row actually move the capture out of the inbox.

## Notes
The design calls these "two one-tap triage chips (Today / Someday); long-press for a project", but its own render wires no handler to them — they are static `div`s, unlike the Today rows, which do carry an `onClick` toggle. So the chips ship as drawn-but-inert, matching the mock exactly.

They were briefly `Pressable`s with accessibility labels and no `onPress`. That is worse than static: TalkBack and VoiceOver announce a button that does nothing. They are now plain [[Ledger Paper Chrome]] chips again.

The data blockers are gone. [[Offline First Local Store]] gave both pages the same task table, so [[Today]] and [[Inbox]] are two filters over one set of rows with stable ids, and "send to Today" is now just `edit(id, { dueDate })`. The inbox header count derives from the list rather than being the literal string `3`.

What is left is a product decision plus one dependency:

- "Someday" still has nothing behind it. The `Someday · 4` section label is still literal, because no column marks a task as someday — a nullable field, a far-future due date, and a separate list are three different products. The same gap [[Ink Decay and Task Retirement]] runs into for its retirement prompt.
- The long-press-for-a-project half needs a native context menu (`zeego`), which is named in the design's tech notes but is not a dependency — the same reason [[Focus Mode]] hangs off the Task Detail ellipsis instead of a row long-press.
- Making the chips interactive means deciding what feedback a triaged row gets as it leaves the list, which the mock does not draw.

## Related
- Page: [[Inbox]], [[Today]]
- Features: [[Offline First Local Store]], [[Ledger Paper Chrome]], [[Natural Language Quick Add]]
- Enhancements: [[Ink Decay and Task Retirement]]
