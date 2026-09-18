# Task Detail

Route: `TaskDetail` (native stack)
Summary: One task opened up — title, when/remind/priority/subtasks label rows, checkable subtasks, a note, and an attachment.

## Related
- Connects to: [[Today]] — reached by long-pressing a task row, [[Focus Mode]] — the ellipsis button in the header, [[Main Tabs]] — the back chevron calls `navigation.goBack()`, [[Project Detail]]
- Features: [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ink Strike-Through Completion]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: none

## Notes
`src/screens/TaskDetailScreen.tsx`. The subtasks are the only interactive part — they toggle against the same `done` map in `src/state/store.tsx` as [[Today]], under separate ids `d1`–`d3`, and use a plain line-through rather than the animated stroke. The breadcrumb names the Studio project, which is what [[Project Detail]] shows.
