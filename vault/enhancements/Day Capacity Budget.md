# Day Capacity Budget

Status: planned
Summary: Give every task a time estimate and every day a finite capacity, so over-committing shows as ink running past the ruled lines instead of a list that silently grows.

## Notes
The most requested and least implemented feature in the category. A day has a fixed number of working hours, minus real calendar events read from the device calendar; the remainder is what can be committed. The user should not be able to stack nineteen tasks on one Tuesday and call it a plan.

The metaphor carries this for free: the sheet visibly fills, and past capacity the ink overruns the ruling. No progress bars, no percentages.

It also gives a "plan my day" action something honest to do — fill tomorrow from the backlog up to the remaining capacity, then stop. The parsing and planning stay invisible; the user never sees the words "AI".

Open decisions:

- Estimates need a field on the task, an input in [[Task Detail]], and a token class in the [[Quick Add Sheet]] parser ("write brief 45m"). `src/lib/parse.ts` already highlights dates and tags, so duration is one more pattern.
- [[Calendar Tally Marks]] currently encode workload as a count of tasks. With estimates they could encode time, which is the more honest signal — but that changes what an already shipped feature means.
- Device calendar access is a new permission and a new dependency (`expo-calendar`), which the design's tech notes do not mention.

The storage half is already there: [[Offline First Local Store]] carries a `duration` column in minutes on every task, and `edit(id, { duration })` writes it. Nothing reads it yet — no parser token, no input on [[Task Detail]], no capacity arithmetic — so the work left is entirely UI and product, not schema.

## Related
- Page: [[Today]], [[Calendar]], [[Task Detail]], [[Quick Add Sheet]]
- Features: [[Offline First Local Store]], [[Calendar Tally Marks]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]]
- Enhancements: [[Closing the Page Ritual]], [[Weekly Spread Review]], [[Deal Me One Task Picker]]
