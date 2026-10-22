# Task Detail

Route: `TaskDetail` (native stack)
Summary: One task opened up — title, when/remind/priority/subtasks label rows, checkable subtasks, a note, and an attachment.

## Related
- Connects to: [[Today]] — reached by long-pressing a task row, [[Focus Mode]] — the ellipsis button in the header, [[Main Tabs]] — the back chevron calls `navigation.goBack()`, [[Project Detail]], [[Unfiled]] — long-pressing an Unfiled row opens this screen
- Features: [[Offline First Local Store]], [[Glass Tab Bar]] — not rendered here, which is the bug above, [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: [[Focus Mode Unreachable]], [[Task And Subtask Ids Share One Done Map]], [[Stack Screens Reserve Tab Bar Space]], [[Undated Unassigned Tasks Have No Screen]] — long-pressing an [[Unfiled]] row opens this screen, [[Stack Screens Ignore The Bottom Safe Area]], [[Ink Stroke Spans The Whole Title Column]]
- Enhancements: [[Day Capacity Budget]], [[Waiting On Follow-Ups]], [[Notes With Live Task Lines]], [[Voice Brain Dump Capture]], [[Adaptive Reminders]]

## Notes
`src/screens/TaskDetailScreen.tsx`. The subtasks are still the only interactive part, and they now come from the `subtasks` table in [[Offline First Local Store]] rather than a literal array in the screen — their own id space under a `parentTaskId`, their own `completedAt`, and a derived `n / m` tally where the mock had the string `1 / 3`. They keep the plain line-through rather than the animated stroke. See [[Task And Subtask Ids Share One Done Map]] for the id space this replaced.

A subtask is a `SubtaskRow` component rather than markup inside the map, because it needs its own `useRuling` to grow — a subtask title is the user's text and wraps. The four label rows above them are fixed chrome and sit at `minHeight: unit`, and the priority row's two pills are the shared `Chip` now instead of two inline copies of it.

Everything above the subtask rows is still the mock's static chrome, hardcoded for the invoice task the screen is built around: the title, the when / remind / priority rows, the `#invoice` chip, the note body and the attachment. The breadcrumb names the Studio project, which is what [[Project Detail]] shows. The row's stored values exist and match what is drawn — the seeded invoice task carries `priority`, a `reminderAt` of 09:30 and the Studio `projectId` — but the screen does not read them yet, and `notes` is deliberately left null so the note body keeps switching language with the app.

The screen takes no route params, so long-pressing any [[Today]] row still opens this one task. That predates the store work and is unchanged.

The attachment caption is two `Text` elements, not one with a newline, so `invoice-0918.pdf · 240 KB` and the Arabic hint below it each resolve their own base direction — see [[In-App RTL and Arabic Typography]].
