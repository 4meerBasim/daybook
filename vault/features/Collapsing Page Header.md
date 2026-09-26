# Collapsing Page Header

Status: shipped
Summary: The 40pt serif page title shrinks to 22pt as the list scrolls under it, with an optional date line above and a count on the right.

## Details
`src/components/PageHeader.tsx`. Each list screen owns a `scrollY` shared value fed by `useAnimatedScrollHandler` and passes it down; the header maps the first 44pt of scroll to a linear interpolation from the 40pt display size to 22pt, setting `lineHeight` to 1.1× the current size so the block stays proportional.

The header also carries an optional italic `dateLine` above the title and a `trailing` monospace label — the remaining-task count on [[Today]], a flat count on [[Inbox]]. Top padding comes from `useHeaderTop()` in `Screen.tsx`, which is the safe-area top inset plus 2.

`dateLine` is a prop, not a string: [[Today]] is the only caller and it passes `longDate(Date.now(), t)`. It used to pass a literal i18n string that named a day in September — see [[Page Header Shows A Frozen Date]]. The italic is `display(15, { weight: 400, italic: true })`, which resolves to Naskh regular in Arabic because that script has no italics.

Under [[Reduced Motion Mode]] the animated style returns an empty object and the title simply stays at 40pt.

[[Inbox Empty]] mounts the header with a `scrollY` that never changes, since that screen does not scroll.

## Related
- Page: [[Today]], [[Upcoming]], [[Inbox]], [[Inbox Empty]]
- Features: [[Reduced Motion Mode]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Startup Crash From Mismatched Worklets]], [[Page Header Shows A Frozen Date]]
