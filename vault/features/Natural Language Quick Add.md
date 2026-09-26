# Natural Language Quick Add

Status: shipped
Summary: Typing a task underlines its dates, times, tags, priority and repeat words as you go, turns them into chips, and says which list the task will land in.

## Details
`src/lib/parse.ts`. A single regex scans the query and splits it into `plain` runs and matched tokens, classified into five kinds:

| Kind | Matches | Colour |
|---|---|---|
| `date` | tomorrow / today / tonight / next week\|monday\|friday, غداً / غدا / اليوم | blue |
| `time` | `3pm`, `10:30am` | blue |
| `tag` | `#health`, `#مشروع` (the class includes the Arabic block) | ochre |
| `pri` | `!`, `!!`, مهم | vermilion |
| `rep` | every day\|week\|monday\|friday\|month, كل يوم\|أسبوع\|شهر | moss |

Each match also emits a chip with a localised label — `High priority` / `أولوية عالية`, `↻ Repeats week` / `↻ يتكرر`, and so on — and `tokenColor` / `chipColors` map the kind onto palette tokens so the highlighting recolours with the theme.

`hasDate` is true when a date or time chip carries no digits; [[Quick Add Sheet]] reads it to show the dashed destination chip, "Saved to Upcoming" when a day is understood and "Saved to Inbox" otherwise — which is what wires this to [[Upcoming]] and [[Inbox]].

The highlighting effect in the sheet is a coloured `Text` rebuilt from `parsed.tokens` on every keystroke with a transparent `BottomSheetTextInput` absolutely filled over it. The mirror is the layer in flow and the input cannot scroll, which is what keeps the caret on its glyph — see [[Quick Add Highlight Drifts From The Caret]] for the arrangement this replaced and why the previous one came apart.

### From tokens to a task

`draft(parsed, now)` is the consuming half, added alongside `parse` in the same file because it owns the same token vocabulary. It turns the token stream into the three things [[Offline First Local Store]] needs:

- **Title** — the `plain` runs joined and collapsed. `tag` and `rep` tokens stay in, because no column captures a tag or a recurrence yet and dropping them would silently discard what the user typed. `date`, `time` and `pri` tokens come out, since the row carries those as real fields.
- **Due date** — resolved against the current date, so "tomorrow" means tomorrow on the day it is typed. `resolveDay` handles today / tonight / tomorrow / next week / next monday / next friday and the Arabic غداً, غدا and اليوم; `applyTime` then refines the hour from a `3pm` or `10:30am` token. A date is only produced when `hasDate` is already true, which keeps the insert consistent with the destination chip the user was shown.
- **Priority** — `PRIORITY_HIGH` when a `pri` token is present, null otherwise.

A time with no day is left in the title rather than thrown away, since that task goes to [[Inbox]] undated.

## Related
- Page: [[Quick Add Sheet]], [[Inbox]], [[Upcoming]], [[Today]]
- Features: [[Offline First Local Store]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Bottom Sheet Text Input Crashes On Web]], [[Quick Add Highlight Drifts From The Caret]]
- Enhancements: [[Day Capacity Budget]], [[Notes With Live Task Lines]], [[Voice Brain Dump Capture]], [[System Capture Entry Points]]
