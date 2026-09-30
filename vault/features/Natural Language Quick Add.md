# Natural Language Quick Add

Status: shipped
Summary: Typing a task underlines its dates, times, tags, priority and repeat words as you go, turns them into chips, says which list the task will land in, and files it there on Add.

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

`hasDate` is true when a date or time chip carries no digits. [[Quick Add Sheet]] reads it to pick the destination: [[Today]] when any day is understood, [[Inbox]] otherwise. The dashed chip says so — "Saved to Today" or "Saved to Inbox". There is no separate list for later days; a task dated tomorrow is filed on Today and carries its day in `meta`. `hasLaterDay` is true when any date word other than today, tonight or اليوم is named, and is stored on the task as `later`, which keeps it out of the Today header count and stamp.

The destination is no longer only a hint. Add, or the keyboard's submit key, creates the task through `addTask` in `src/state/store.tsx`: the `plain` tokens joined become the title (falling back to the raw text if nothing plain is left), the date, time and repeat chips become its `meta` (a date chip that reads exactly "Today" is dropped), and the project comes from the sheet's project chips, "No project" by default. The task then appears under that project's row on the destination tab — see [[Project Grouped Tasks]] — and as the first row of [[Recent]], which lists every task newest first. Tags and priority are still highlighted and chipped but are not stored on the task.

The highlighting effect in the sheet is a transparent `BottomSheetTextInput` layered over an absolutely positioned coloured `Text` rebuilt from `parsed.tokens` on every keystroke.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Inbox]], [[Recent]]
- Features: [[Project Grouped Tasks]], [[Pen FAB Tab Bar]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Sheet Shown On Launch]]
