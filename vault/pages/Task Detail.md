# Task Detail

Route: `TaskDetail` (native stack)
Summary: One task opened up — title, when/remind/priority/subtasks label rows, checkable subtasks and a note, all read from the row the caller passed in.

## Related
- Connects to: [[Today]] — reached by long-pressing a task row, [[Focus Mode]] — the ellipsis button in the header, [[Main Tabs]] — the back chevron calls `navigation.goBack()`, [[Project Detail]], [[Unfiled]] — long-pressing an Unfiled row opens this screen, [[Upcoming]] — long-pressing a row there opens it too, [[Project Picker]]
- Features: [[Offline First Local Store]], [[Glass Tab Bar]] — not rendered here, which is the bug above, [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]], [[Day Capacity Budget]], [[Inbox Triage Chips]]
- Bugs: [[Focus Mode Unreachable]], [[Task And Subtask Ids Share One Done Map]], [[Stack Screens Reserve Tab Bar Space]], [[Undated Unassigned Tasks Have No Screen]] — long-pressing an [[Unfiled]] row opens this screen, [[Stack Screens Ignore The Bottom Safe Area]], [[Ink Stroke Spans The Whole Title Column]] — not affected; its subtasks use `textDecorationLine`, [[Task Detail And Focus Show A Mock Task]]
- Enhancements: [[Waiting On Follow-Ups]], [[Notes With Live Task Lines]], [[Voice Brain Dump Capture]], [[Adaptive Reminders]]

## Notes
`src/screens/TaskDetailScreen.tsx`. The subtasks are still the only interactive part, and they now come from the `subtasks` table in [[Offline First Local Store]] rather than a literal array in the screen — their own id space under a `parentTaskId`, their own `completedAt`, and a derived `n / m` tally where the mock had the string `1 / 3`. They keep the plain line-through rather than the animated stroke. See [[Task And Subtask Ids Share One Done Map]] for the id space this replaced.

A subtask is a `SubtaskRow` component rather than markup inside the map, because it needs its own `useRuling` to grow — a subtask title is the user's text and wraps. The four label rows above them are fixed chrome and sit at `minHeight: unit`, and the priority row's two pills are the shared `Chip` now instead of two inline copies of it.

The screen takes a `taskId` route param and reads the row through `useTaskDetail`, so every field is the stored value: the title, `longDate` plus `timeLabel` for when, `reminderAt` for remind, the high-priority pill when `priority` is `PRIORITY_HIGH`, a chip per stored tag, and the note body when `notes` is set. A field with no value says so — `No date`, `No reminder` — and the priority, subtask and note blocks are omitted entirely when the row has none, so the screen never draws a label over nothing. The breadcrumb names the task's own project, or stays empty when it has none. See [[Task Detail And Focus Show A Mock Task]] for what this replaced.

The title checkbox toggles `completedAt` and strikes the title through, which it did not do while the screen was static.

There is no attachment row. Nothing backs attachments yet; it returns with [[Voice Brain Dump Capture]].

The attachment caption is two `Text` elements, not one with a newline, so `invoice-0918.pdf · 240 KB` and the Arabic hint below it each resolve their own base direction — see [[In-App RTL and Arabic Typography]].
