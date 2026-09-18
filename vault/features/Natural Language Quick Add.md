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

The highlighting effect in the sheet is a transparent `BottomSheetTextInput` layered over an absolutely positioned coloured `Text` rebuilt from `parsed.tokens` on every keystroke.

## Related
- Page: [[Quick Add Sheet]], [[Inbox]], [[Upcoming]]
- Features: [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]]
