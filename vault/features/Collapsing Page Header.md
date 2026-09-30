# Collapsing Page Header

Status: shipped
Summary: The 40pt serif page title shrinks to 22pt as the list scrolls under it, with an optional date line above and a count on the right.

## Details
`src/components/PageHeader.tsx`. Each list screen owns a `scrollY` shared value fed by `useAnimatedScrollHandler` and passes it down; the header maps the first 44pt of scroll to a linear interpolation from the 40pt display size to 22pt, setting `lineHeight` to 1.1× the current size so the block stays proportional.

The header also carries the optional italic `dateLine` (used only on [[Today]], "Thursday, 18 September") and a `trailing` monospace label — the remaining-task count on [[Today]], a flat count on [[Inbox]]. Both are derived from `useTasks()` filtered by list, so they follow tasks added, completed or cleared elsewhere, and neither changes with the page's search query. [[Recent]] passes no trailing label. Top padding comes from `useHeaderTop()` in `Screen.tsx`, which is the safe-area top inset plus 2.

Under [[Reduced Motion Mode]] the animated style returns an empty object and the title simply stays at 40pt.

[[Inbox Empty]] mounts the header with a `scrollY` that never changes, since that screen does not scroll. [[Project Detail]] does not use this component — its 40pt project name is laid out inline and does not collapse.

## Related
- Page: [[Today]], [[Recent]], [[Inbox]], [[Inbox Empty]]
- Features: [[Reduced Motion Mode]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none
