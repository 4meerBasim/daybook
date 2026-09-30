# Light and Dark Paper Palettes

Status: shipped
Summary: The whole app renders from one fifteen-token palette with a cream-paper light set and an ink-on-dark set, selectable as light, dark, or follow-system.

## Details
`src/theme/palette.ts` defines a `Palette` type and two instances. Both carry the same roles so nothing branches on theme at the call site:

- paper surfaces — `paper`, `paper2`, `card`, `rule`
- ink text — `ink`, `ink2`, `ink3`
- four accents, each with a soft companion for chip and swipe backgrounds — `ver`/`verS` (vermilion), `och`/`ochS` (ochre), `moss`/`mossS`, `blue`/`blueS`

`ThemeProvider` resolves `appearance` (`light` | `dark` | `auto`) against `systemDark`, which `App.tsx` feeds from `useColorScheme()`. The result flows out as `c` and every screen styles from it — there are no inline hex values in `src/screens/` or `src/components/`. `Root.tsx` also rebuilds the React Navigation theme from the palette so stack transitions do not flash white, and `App.tsx` swaps the status bar style off `dark`.

The accent roles carry meaning consistently: vermilion is the margin rule, the overdue marker and the wax stamp; blue is dates and times; ochre is tags; moss is habits, completion and sync — including the filled habit circle and session count of [[Habit Session Timer]].

Controlled from the Appearance segmented control on [[Settings]].

## Related
- Page: [[Settings]], [[Onboarding]], [[Main Tabs]], [[Today]], [[Recent]], [[Inbox]], [[Inbox Empty]], [[Profile]], [[Quick Add Sheet]], [[Calendar]], [[Project Detail]], [[Task Detail]], [[Focus Mode]], [[Habit]], [[Page Closed]], [[Swipe States]]
- Features: [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Natural Language Quick Add]], [[Wax Page Closed Stamp]], [[Habit Session Timer]]
- Bugs: none
