# Task Detail

Route: `TaskDetail` (native stack)
Summary: One task opened up — title, when/remind/priority/subtasks label rows, checkable subtasks, a note, and an attachment.

## Related
- Connects to: [[Project Detail]], [[Recent]] — reached by long-pressing a task row on either; the back chevron calls `navigation.goBack()`, [[Focus Mode]] — the ellipsis button in the header, [[Main Tabs]]
- Features: [[Swipe Row Actions]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: none

## Notes
`src/screens/TaskDetailScreen.tsx`. The subtasks are the only interactive part — they toggle against the same `done` map in `src/state/store.tsx` as the task rows on [[Project Detail]], under separate ids `d1`–`d3`, and use a plain line-through rather than the animated stroke. The breadcrumb names the Studio project. The route takes no params, so every row on [[Project Detail]] and [[Recent]] opens this same fixed task, whichever project it was pressed in.

The attachment caption is two `Text` elements, not one with a newline, so `invoice-0918.pdf · 240 KB` and the Arabic hint below it each resolve their own base direction — see [[In-App RTL and Arabic Typography]].
