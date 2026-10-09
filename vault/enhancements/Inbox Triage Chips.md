# Inbox Triage Chips

Status: planned
Summary: Make the "Today" and "Someday" chips on each undated capture actually move it out of the unfiled pile.

## Notes
Needs rebasing. This was written against the Inbox screen, which no longer exists — `InboxScreen.tsx`, the `inbox` tab, the `inbox` store slice and the `someday` / `nothingWaiting` strings all went in the tab-bar redesign. The chips it describes went with them. What survives is the product idea and the data behind it; what it has lost is the surface.

The rows it was about are still being created. `insertTask` writes `projectId` NULL and [[Quick Add Sheet]] writes `dueDate` NULL whenever no day is parsed, so undated unfiled captures accumulate — they just have no screen listing them, which is [[Undated Unassigned Tasks Have No Screen]]. That bug has to be resolved before this one means anything, and its resolution decides where these chips live: on an "unfiled" section somewhere, or on [[Today]] if dateless captures land there instead.

The design calls these "two one-tap triage chips (Today / Someday); long-press for a project", but its own render wires no handler to them — they were static `div`s, unlike the Today rows, which do carry an `onClick` toggle. So they shipped as drawn-but-inert, matching the mock exactly. They were briefly `Pressable`s with accessibility labels and no `onPress`, which is worse than static: TalkBack and VoiceOver announce a button that does nothing.

The data blockers were already gone before the redesign and still are. [[Offline First Local Store]] gives every list the same task table with stable ids, so "send to Today" is just `edit(id, { dueDate })`.

What is left:

- A surface. See above — this is the new blocker and it did not exist when this note was written.
- "Someday" still has nothing behind it. The `Someday · 4` section label was a literal, and no column marks a task as someday — a nullable field, a far-future due date, and a separate list are three different products. The same gap [[Ink Decay and Task Retirement]] runs into for its retirement prompt.
- Making the chips interactive means deciding what feedback a triaged row gets as it leaves the list, which the mock does not draw.

The long-press-for-a-project half was done and is now half-lost. A plain `Pressable` with `onLongPress` plus a `Modal` sheet covered it with no new dependency — no `zeego`, contrary to the design's tech notes, because the picker is a sheet rather than a menu. But the Inbox row was one of [[Project Picker]]'s two callers, so filing an unfiled capture into a project is currently unreachable; only a [[Project Detail]] row still opens the picker. See [[Projects As A Real Entity]].

## Related
- Page: [[Today]], [[Quick Add Sheet]], [[Project Picker]], [[Main Tabs]]
- Features: [[Offline First Local Store]], [[Projects As A Real Entity]], [[Ledger Paper Chrome]], [[Natural Language Quick Add]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Ink Decay and Task Retirement]]
