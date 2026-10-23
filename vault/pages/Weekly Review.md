# Weekly Review

Route: `Weekly` (native stack)
Summary: The week as a balance sheet — a ruled row per day, a committed-against-settled balance, and a heat read of which weekdays settle work.

## Related
- Connects to: [[Calendar]] — the "This week" control in its header opens this screen, [[Settings]] — the Weekly review row, [[Profile]] — the same row, [[Main Tabs]] — the back chevron returns
- Features: [[Weekly Spread Review]], [[Calendar Tally Marks]], [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]

## Notes
`src/screens/WeeklyScreen.tsx`. Reads the `closedDays` slice rather than its own query. The week window is `startOfWeek(now, t.firstWeekday)`, so the row order follows the language — Monday first in English, Saturday first in Arabic, matching `longDate`.

The heat read reuses the same `SpreadRow` as the spread, passing a normalised 0–5 count into [[Calendar Tally Marks]] so the busiest weekday reads as five marks and the rest scale against it.
