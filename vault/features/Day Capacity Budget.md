# Day Capacity Budget

Status: shipped
Summary: Every task can carry a time estimate and every day a finite capacity, so over-committing shows as ink running past the ruled lines instead of a list that silently grows.

## Details
Four parts: the estimate gets parsed, stored, shown and edited; the day gets a capacity; [[Today]] states the balance and marks the overrun; and "plan tomorrow" fills from the backlog until the capacity is gone.

**Parsing.** `src/lib/parse.ts` gains a `dur` token alongside date, time, tag, priority and repeat. It highlights in moss as you type, chips as `45m`, and is stripped from the title the way the date tokens already are — "write brief 45m" stores a 45-minute estimate on a task called "write brief". Both scripts are covered: `45m`, `1h`, `90 min`, `15mins`, and `45 د`, `2 ساعة`, `90 دقيقة`, including Arabic-Indic digits (`٤٥ د`). The Latin units keep their `\b`, but the Arabic ones cannot — Arabic letters are not `\w`, so a trailing `\b` never matches after `د` and the alternative has to be written without one. `durationMinutes` normalises Arabic-Indic digits before `Number`.

The time branch is now matched by shape (`3pm`, `10:30 am`) rather than by "contains a digit", because a duration also contains a digit and would otherwise have been read as a clock time.

`ساعتين` and other dual/word forms are not parsed — that needs word-number parsing, and the app's own Arabic copy writes durations with digits.

**Storage.** No migration: [[Offline First Local Store]] already carried a `duration` column in minutes. `insertTask` now writes it, which it did not before, and `NewTask` carries it through [[Natural Language Quick Add]].

**Editing.** [[Task Detail]] has an ESTIMATE field — a `Segmented` of None / 15m / 30m / 1h / 2h writing `duration` through `edit`. It reuses the same control [[Settings]] uses for appearance rather than introducing a picker.

**The balance.** `CapacityLine` sits under [[Today]]'s header: `3h 20m / 6h` in the mono label style, turning `c.ver` and gaining "over the page" once committed exceeds capacity. Capacity is a preference — 4h / 6h / 8h in [[Settings]], default 6h, stored in the `prefs` table. Committed counts only incomplete rows due today.

Rows without an estimate are counted separately rather than being given a default: the line says `3 unestimated` on the trailing edge. Inventing 30 minutes for every unestimated row would make the balance a guess presented as a fact, and the whole point of the feature is that the number is honest.

**The overrun.** No bar, no percentage. `EmptyRules` takes an `overrun` count and draws that many of [[Today]]'s trailing blank rules in `c.ver` at 1.5pt instead of `c.rule` at 1pt — one rule per hour over, capped at the four that exist. The ink literally runs past the ruled lines, which is what the metaphor promised.

**Plan tomorrow.** The button on [[Page Closed]] was a `goBack`. It now calls `planTomorrow()`: read tomorrow's booked estimates, subtract from capacity, then walk the undated backlog in the user's own sort order and date anything that fits into what is left. It skips a row too big for the remaining room rather than stopping dead at it, so one three-hour task at the top of the pile does not block the four twenty-minute ones under it. Only estimated rows are pulled — an unestimated row would consume zero and the whole backlog would land on tomorrow. When nothing fits, the screen says so instead of navigating away.

## Decisions taken
- **[[Calendar Tally Marks]] still count tasks, not time.** Re-encoding them as hours would change the meaning of a shipped feature on a screen that does not yet show capacity anywhere. The tally stays a count; [[Weekly Spread Review]] is where time-weighted aggregates belong.
- **No `expo-calendar`.** Reading real events off the device would make capacity "working hours minus meetings", which is more accurate, but it adds a permission prompt and a dependency for a number the user can already set directly. Capacity is working hours as configured, and committed is the sum of estimates.

## Related
- Page: [[Today]], [[Calendar]], [[Task Detail]], [[Quick Add Sheet]], [[Settings]], [[Page Closed]]
- Features: [[Offline First Local Store]], [[Calendar Tally Marks]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]]
- Enhancements: [[Closing the Page Ritual]], [[Weekly Spread Review]], [[Deal Me One Task Picker]]
- Bugs: [[Calendar Overflow Is Unreachable]]
