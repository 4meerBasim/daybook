# Inbox Triage Chips

Status: planned
Summary: Give each inbox capture one-tap "Today" and "Someday" chips that actually move it out of the inbox.

## Notes
The design calls these "two one-tap triage chips (Today / Someday); long-press for a project", but its own render wires no handler to them — they are static `div`s, unlike the Today rows, which do carry an `onClick` toggle. So the chips ship as drawn-but-inert, matching the mock exactly.

They were briefly `Pressable`s with accessibility labels and no `onPress`. That is worse than static: TalkBack and VoiceOver announce a button that does nothing. They are now plain [[Ledger Paper Chrome]] chips again.

The static chips have since been removed. With [[Project Grouped Tasks]] the [[Inbox]] page lists projects, not captures, so there is no capture row on that page to hang a chip on; the individual captures are now task rows on [[Project Detail]]. The enhancement is still planned, but it has to decide where the chips go before anything else.

That change also cleared most of the blockers listed below: there is now a single task list with stable ids that every page filters by `list`, so "send to Today" has a destination, and the inbox header count is derived. What remains is a store action that changes a task's `list`, a Someday list to send things to (the `Someday · 4` label is still a literal), and the context-menu half.

The original list, kept for history — wiring this up needed decisions the design does not make:

- Where a triaged row lands. [[Today]] and [[Inbox]] read from two separate seed arrays with no shared identity, so "send to Today" has no destination to write to.
- The inbox count in the header is the literal string `3`, and the `Someday · 4` section label is literal too. Both would have to become derived.
- Inbox rows are keyed by title; they carry no stable id the way today's tasks do.
- The long-press-for-a-project half needs a native context menu (`zeego`), which is named in the design's tech notes but is not a dependency — the same reason [[Focus Mode]] hangs off the Task Detail ellipsis instead of a row long-press.

Doing this properly means giving the seed data real ids and a single task list that both pages filter, which is a larger change than a fidelity pass should make unilaterally.

## Related
- Page: [[Inbox]], [[Today]], [[Project Detail]]
- Features: [[Project Grouped Tasks]], [[Ledger Paper Chrome]], [[Natural Language Quick Add]]
