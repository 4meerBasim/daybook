# Habit Session Timer

Status: shipped
Summary: A count-up timer for each habit that records every run as a session of that habit, shows how many sessions it has today, and lists each one with its start time and duration.

## Details
The sessions live in `src/state/store.tsx` as `habitSessions`, an array of `{ habitId, startedAt, seconds }` (`HabitSession`), appended to by `addHabitSession`. It is one array for all habits; each reader filters it by `habitId`. The habits themselves come from `useHabits()` — the seeded habit `h1` plus any added through [[Add Habits and Projects]]. It is plain `useState` like the rest of the store — in memory only, gone on restart, and never filtered by date, so "today" means since the app was launched.

The `Habit` route takes `{ habitId }`, and `Root` hands it to `HabitScreen` as a prop; the screen finds the habit by that id for its title and streak and keeps only that habit's sessions. The clock itself is local to `src/screens/HabitScreen.tsx`, like the countdown of [[Focus Timer]], the sibling it is modelled on. `startedAt` holds the start timestamp or `null`; while it is set, a one-second `setInterval` recomputes `elapsed` from `Date.now() - startedAt`, so the display cannot drift. It renders as `mm:ss` at 64pt monospace with `tabular-nums`, `allowFontScaling={false}` and the `timer` accessibility role. Minutes are not capped at 59 — a run past an hour reads `60:00` and up.

A habit can carry a target: `minutes` on `Habit`, entered in the add sheet's "TIME (MINUTES)" field — see [[Add Habits and Projects]] — 30 for the seeded habit and 0 for none. When it is above zero, a monospace caption under the clock reads "TARGET · 30 min" (`t.target`, `t.minShort`) in `ink3`, and the clock turns from ink to moss once `elapsed` reaches the target in seconds. The colour follows `elapsed`, so a stopped run that met the target stays moss until the next Start zeroes it. The target changes nothing else: the timer keeps counting past it and does not stop or record on its own.

The primary button calls `toggleRun` with a medium impact haptic:

- Start — zeroes `elapsed` and stamps `startedAt`. The button relabels to Stop (`t.startTimer` / `t.stop`) and stays ink, since paper text on vermilion falls just short of AA contrast in the light palette.
- Stop — appends `{ habitId, startedAt, seconds }` to the store through `record` and leaves the final time on the clock. A run of zero seconds is not recorded.

A run that is still going is saved whenever the screen goes away: an unmount cleanup reads the start time from a ref and calls `record`. That covers the outlined check button, which only calls `onClose`, and the Android back button alike, and it cannot double-record because Stop clears the start time first.

Below the clock, the session count is the number of this habit's sessions in 34pt moss under the `t.sessionsToday` caption. Screen readers get worded labels: the clock and each history row announce minutes and seconds, and a row reads as its number, when it started and how long it lasted. The history list numbers the sessions in the order they were recorded and reverses them, so the newest is on top: session number, start time as 24-hour `HH:mm`, and duration as `mm:ss`. An empty list shows `t.noSessions`.

On [[Today]] each habit has a row: a `Pressable` that opens the page for that habit, greys to `paper2` while pressed, and announces the name with that habit's session count. Its circle is `checked` once that habit has at least one session. A habit with a target shows it after the name as "30 min" in `ink3` monospace; one without shows nothing there. `Checkbox` in `src/components/Ledger.tsx` now fills with its own border colour when checked rather than always ink, so the circle fills moss while task boxes, which pass no colour, still fill ink — see [[Ledger Paper Chrome]].

The clock, the start times and the durations are pinned to `writingDirection: 'ltr'` so the digits keep their order in Arabic, and the tally icon takes `flip={rtl}` — see [[In-App RTL and Arabic Typography]]. The new strings have Arabic counterparts in `src/i18n/strings.ts`. The streak does not move with sessions: it is a field on the habit, fixed at 12 for the seeded one and 0 for added ones, and both screens draw the tally only when it is above zero.

## Related
- Page: [[Habit]], [[Today]]
- Features: [[Add Habits and Projects]], [[Focus Timer]], [[Ledger Paper Chrome]], [[Light and Dark Paper Palettes]], [[In-App RTL and Arabic Typography]]
- Bugs: none
