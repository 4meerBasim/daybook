# Inbox Triage Chips

Status: planned
Summary: Make the "Today" and "Someday" chips on each inbox row actually move the capture out of the inbox.

## Notes
The design calls these "two one-tap triage chips (Today / Someday); long-press for a project", but its own render wires no handler to them — they are static `div`s, unlike the Today rows, which do carry an `onClick` toggle. So the chips ship as drawn-but-inert, matching the mock exactly.

They were briefly `Pressable`s with accessibility labels and no `onPress`. That is worse than static: TalkBack and VoiceOver announce a button that does nothing. They are now plain [[Ledger Paper Chrome]] chips again.

Wiring this up needs decisions the design does not make:

- Where a triaged row lands. [[Today]] and [[Inbox]] read from two separate seed arrays with no shared identity, so "send to Today" has no destination to write to.
- The inbox count in the header is the literal string `3`, and the `Someday · 4` section label is literal too. Both would have to become derived.
- Inbox rows are keyed by title; they carry no stable id the way today's tasks do.
- The long-press-for-a-project half needs a native context menu (`zeego`), which is named in the design's tech notes but is not a dependency — the same reason [[Focus Mode]] hangs off the Task Detail ellipsis instead of a row long-press.

Doing this properly means giving the seed data real ids and a single task list that both pages filter, which is a larger change than a fidelity pass should make unilaterally.

## Related
- Page: [[Inbox]], [[Today]]
- Features: [[Ledger Paper Chrome]], [[Natural Language Quick Add]]
