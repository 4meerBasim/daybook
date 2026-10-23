# Weekly Spread Review

Status: shipped
Summary: A week read as a balance sheet — committed against settled, tally marks per day, and a heat read of which weekdays actually settle work.

## Details
The honest alternative to a streak counter: no streak, no punishment, just what the ledger recorded. `WeeklyScreen` has three blocks.

**The spread.** One ruled row per day of the week, labelled from `t.weekdays` so it starts Monday in English and Saturday in Arabic, with the date, [[Calendar Tally Marks]] for what settled, and an `n/m` ratio. A day with no closed page shows an em dash in dimmed ink rather than a zero — nothing was recorded, which is different from nothing being done. Earlier and later controls step the window; "later" only appears once there is a later week to go to.

**The balance.** Committed, settled, carried, moved and struck for the week, summed from `closed_days`. Settled is in moss, struck in vermilion, the rest neutral — the balance is a record, not a scoreboard. When [[Day Capacity Budget]] estimates exist it adds an hours line, settled against committed, which is the more useful statement the note predicted.

**When work happens.** The heat read, and the part that tells the user something no todo app tells them. It aggregates every closed page ever recorded by weekday, normalises against the busiest weekday, and draws tally marks proportionally. Over a few weeks this is what says Thursdays are fiction.

**Where it lives.** A sibling route to [[Calendar]], reached from a "This week" control in the Calendar header — the natural place, since the two read the same history at different resolutions — and from a "Weekly review" row in [[Settings]] and [[Profile]].

## Decisions taken
- **One page with the margin rule, not a two-page spread.** A true spread needs landscape or a tablet. On a phone it is one ledger page, with the heat read sitting below its own `SectionLabel` and carrying the red margin line so it reads as a second section of the same sheet rather than a separate screen.
- **Aggregated client-side from the `closedDays` slice.** The store already loads every closed day for the archive, so the week and the heat read are both filters over an array in memory rather than two more queries. One row per closed day means a year is 365 rows; if that stops being cheap, the heat read is the one to push into SQL as a `GROUP BY`.
- **Counts, not hours, in the tally marks.** Same decision [[Day Capacity Budget]] took: the tally is a count everywhere it appears, and the hours live in the balance block where they are labelled.

## Related
- Page: [[Calendar]], [[Today]], [[Upcoming]], [[Settings]], [[Profile]], [[Closed Pages]], [[Page Closed]]
- Features: [[Calendar Tally Marks]], [[Ledger Paper Chrome]], [[Closing the Page Ritual]], [[Day Capacity Budget]], [[In-App RTL and Arabic Typography]]
- Bugs: [[Calendar Overflow Is Unreachable]]
