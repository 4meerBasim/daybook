# Closing the Page Ritual

Status: shipped
Summary: Closing the day is a deliberate act — every unfinished row gets one decision, the page is stamped, and it becomes read-only history you can open again.

## Details
The signature feature. Nothing rolls over on its own: a row left on the page must be **carried**, **struck** or **moved** before the page can be stamped, and carrying it increments a count the row then wears.

**Schema v4.** `carryCount INTEGER NOT NULL DEFAULT 0` on `tasks`, plus two new tables:

- `closed_days` — one row per closed day: `closedAt`, and the counts of settled / carried / struck / rescheduled, with `committedMinutes` and `settledMinutes` from [[Day Capacity Budget]]'s estimates.
- `closed_entries` — `(day, taskId, title, seedKey, outcome)`, one row per task that was on the page.

`closed_entries` stores the **title at close time**, not just a reference. That is what makes the archive read-only history rather than a view: a carried row's `dueDate` has already moved to the next day, so the closed page cannot be derived from `tasks` afterwards, and renaming or deleting the task later must not rewrite what the page recorded.

**The decision pass.** `ClosePageScreen` lists every incomplete row with three one-tap outcomes:

| Outcome | Write | Carry count |
|---|---|---|
| Carry | `dueDate` to tomorrow | increments |
| Strike | `deletedAt` — abandoned | unchanged |
| Move | `dueDate` to a day picked from a sheet (+3 days, next week) | unchanged |

Carrying is the only outcome that increments, which is the whole point: drift is what the count measures. Deliberately replanning to next week is not drift, so Move leaves it alone.

Stamping is disabled until every row has a decision, and the screen says so rather than failing silently on tap. The whole commit — every task write, the `closed_days` row, the `closed_entries` rows — runs in one `withTransactionAsync`, so a half-closed page is not reachable.

**The entry point.** The mock had no state for closing a page with work still on it: the stamp appeared only when `leftN === 0`. Now [[Today]] has both paths. With rows left, the last ledger row reads "Close the page" and opens the decision pass. With nothing left, the stamp appears as before and closing needs no decisions, so tapping it runs the close directly. Once the day has a `closed_days` row the stamp stops being a close button and opens the closed page instead, so a day cannot be closed twice.

**The carry count in the margin.** `TaskRow` takes `carryCount` and draws `4×` in ochre next to the row's time, the colour the app already uses for annotation. It is hidden on a struck row, where it would be reading a count off something already settled.

**Page Closed is real.** It took no params and drew five hardcoded titles from `t.task1`–`t.task5` as a non-interactive overlay over empty rules. It now takes a `day`, reads that day through `useClosedPage`, and lists the real entries with their outcome in the trailing label — settled and struck strike through, carried stays in full ink because it is still live work. The stamp carries the real `closedAt`, and the counts line is derived. When estimates exist it also states settled against committed minutes.

**The archive.** `ClosedPagesScreen`, reached from a "Closed pages" row in [[Settings]] and [[Profile]], lists every closed day newest first with [[Calendar Tally Marks]] for what settled and an `n/m` ratio. Tapping one opens that page.

## Decisions taken
- **Reversing a close is not offered.** [[Lift The Ink]] reverses one write; a close is a transaction over every row on the page plus two archive tables. Undoing it means unwinding all of that, and the ritual's weight is the point — a page you can un-close is the silent rollover this feature exists to refuse.
- **Move offers two fixed days, not a date picker.** +3 days and next week cover the honest cases. A free date picker belongs with [[Calendar]] being made writable.
- **"Someday" is not a third destination yet.** Nothing marks a task as someday; [[Inbox Triage Chips]] is where that column lands, and Move gains it there.

## Related
- Page: [[Page Closed]], [[Today]], [[Upcoming]], [[Settings]], [[Profile]]
- Features: [[Offline First Local Store]], [[Wax Page Closed Stamp]], [[Ink Strike-Through Completion]], [[Ledger Paper Chrome]], [[Day Capacity Budget]], [[Calendar Tally Marks]], [[Lift The Ink]]
- Enhancements: [[Ink Decay and Task Retirement]], [[Weekly Spread Review]], [[Inbox Triage Chips]], [[Waiting On Follow-Ups]]
