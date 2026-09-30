# Focus Timer

Status: shipped
Summary: A 25-minute session clock that counts down in the shared store and inks in one paper strip per elapsed minute.

## Details
The clock is app-level, not screen-level: `src/state/store.tsx` holds `left` (seconds, starting at 1499) and `running`, and a single `setInterval` decrements once a second, wrapping back to 1500 at zero. A `runningRef` keeps the interval from being torn down and rebuilt on every pause, so the tick survives re-renders and the countdown continues whether or not [[Focus Mode]] is mounted.

`src/screens/FocusScreen.tsx` renders it as `mm:ss` at 64pt monospace with `fontVariant: ['tabular-nums']` so the digits do not jitter, and `writingDirection: 'ltr'` so the clock stays readable in Arabic. Below it, twenty-five 1.5pt `Strip` components each interpolate from `c.rule` to `c.ink` over 600ms; `filled = 25 - Math.ceil(left / 60)` decides how many are inked, so the column fills like a ruled page being worked through.

The primary button calls `toggleRun` and relabels itself Pause / Resume from `t.pause` / `t.resume`; the outlined check button closes the session. Under [[Reduced Motion Mode]] the strips change colour instantly.

[[Habit Session Timer]] is the count-up sibling modelled on this screen: the same clock face and button pair, but it records each run as a session.

## Related
- Page: [[Focus Mode]]
- Features: [[Habit Session Timer]], [[Reduced Motion Mode]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Focus Mode Unreachable]]
