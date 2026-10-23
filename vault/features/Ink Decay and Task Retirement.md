# Ink Decay and Task Retirement

Status: shipped
Summary: A task's ink fades as it ages, and past three carries the row stops being offered silently and asks once — do it, schedule it, or shelve it.

## Details
**The fade.** `inkDecay(task, now, enabled)` in `src/lib/decay.ts` returns 0 to 1 over `DECAY_DAYS = 14` from the row's `createdAt`, which [[Offline First Local Store]] already persists. `TaskRow` takes it as a `decay` prop and mixes the title's base ink with `mixInk` — a plain hex lerp, computed on the JS side because the value is static per render; the animated `interpolateColor` still handles the completion stroke on top of it.

Completed rows never fade — they already resolve to `ink3`, and ageing a settled row says nothing.

**The contrast floor** is `ink2`, not `ink3`. Measured against both palettes:

| | fresh (`ink`) | floor (`ink2`) | `ink3` |
|---|---|---|---|
| on light paper | 13.8:1 | **6.9:1** | 4.1:1 |
| on dark paper | 14.7:1 | **8.6:1** | — |

`ink3` would have taken 17pt body text to 4.1:1, under AA. `ink2` bottoms out well clear of it, which is what the note asked for — the fade reads as age without ever becoming a legibility problem.

It is defeatable: an "Ink fades with age" toggle in [[Settings]], stored in `prefs`, sitting next to [[Reduced Motion Mode]] exactly as the note proposed. Off means `inkDecay` returns 0 and every row draws in full ink.

Applied on [[Today]], [[Upcoming]] and [[Unfiled]], including the Someday section.

**The retirement prompt.** `asksRetirement(task)` is true once `carryCount >= 3` and the row has not already been asked at that count. Schema v6 adds `retireAskedCarry`, which records the count the question was answered at — so it asks once per carry rather than once ever, and a row carried a fourth time asks again. That is the "asks once" the note wanted without the question becoming either nagging or a one-time event the user can lose.

On [[Today]], a row that asks gets a `RetirementPrompt` directly beneath it on `ochS` with three one-tap outcomes:

- **Do it** — dates it today
- **Next week** — dates it a week out
- **Someday** — writes `somedayAt`, shelving it to [[Unfiled]]'s Someday section

All three raise the [[Lift The Ink]] slip, so an accidental retirement is reversible, and all three record the answer in the same write.

The prompt's own text is `ink2` on `ochS` (6.3:1 / 6.9:1) and the carry mark on a row is `ink2` rather than ochre. The palette's accent inks measure 4.0–4.4:1 on light paper — `och` 4.36, `ver` 4.41 — so new small text takes a neutral and lets colour carry meaning through the prompt's background instead. Changing the accents themselves would alter [[Light and Dark Paper Palettes]], which is shipped.

## Decisions taken
- **Age runs from `createdAt`, not from a last-touched stamp.** No column records a touch, and adding one would mean deciding that carrying a row counts as touching it — which would stop the fade on exactly the rows this feature exists to surface. A row you keep carrying is getting staler, and the fade should say so.
- **14 days to the floor.** Long enough that a normal week's work never visibly fades, short enough that a month-old capture is unmistakable.
- **Three carries to the prompt.** Two is a normal slip; three is a pattern.

## Related
- Page: [[Today]], [[Upcoming]], [[Unfiled]], [[Settings]], [[Profile]]
- Features: [[Offline First Local Store]], [[Ink Strike-Through Completion]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]], [[Closing the Page Ritual]], [[Inbox Triage Chips]], [[Lift The Ink]], [[Reduced Motion Mode]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]]
