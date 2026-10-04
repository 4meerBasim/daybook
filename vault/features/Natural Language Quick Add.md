# Natural Language Quick Add

Status: shipped
Summary: Typing a task underlines its dates, times, tags, priority and repeat words as you go, turns them into chips, says which list the task will land in, and files it there on "Add task".

## Details
`src/lib/parse.ts`. A single regex scans the query and splits it into `plain` runs and matched tokens, classified into five kinds:

| Kind | Matches | Colour |
|---|---|---|
| `date` | tomorrow / today / tonight / next week\|monday\|friday; bare weekdays monday…sunday and الأحد…السبت; relative offsets `in N days`\|`in N weeks` and بعد N يوم\|أيام\|أسبوع\|أسابيع; time words noon / midnight / morning / afternoon / evening and ظهراً / منتصف الليل / صباحاً / عصراً / مساءً; `at H`\|`at H:MM` (24h); غداً / غدا / اليوم | blue |
| `time` | `3pm`, `10:30am` | blue |
| `tag` | `#health`, `#مشروع` (the class includes the Arabic block) | ochre |
| `pri` | `!` / `!!!` / urgent / important / مهم / عاجل → high; `!!` → medium | vermilion |
| `rep` | every day\|week\|monday\|friday\|month, كل يوم\|أسبوع\|شهر | moss |

Phase 5 extended the `date` family while reusing the existing kinds — no new chip rendering. Relative offsets and bare weekdays resolve to a real `dueAt` via `inDays` / `inWeeks` / `nextWeekdayAt` in `src/lib/day.ts` (the next upcoming occurrence at the 09:00 morning preset); time words and `at H` resolve via `timeToday` (that hour today, or the same hour tomorrow if already past). A bare weekday never double-matches "next monday/friday" — the `next …` and `every …` alternatives sit first in the regex and are matched at that position, consuming the weekday. This feature realises [[Magic-plus drag insert]].

Each match also emits a chip with a localised label — `High priority` / `أولوية عالية`, `↻ Repeats week` / `↻ يتكرر`, and so on — and `tokenColor` / `chipColors` map the kind onto palette tokens so the highlighting recolours with the theme.

`hasDate` is true when a date chip carries a resolved due value, or when a date or time chip carries no digits — so a dated task such as "in 3 days" or "at 15:00" still routes to a day. [[Quick Add Sheet]] reads it to pick the destination: [[Today]] when any day is understood, [[Inbox]] otherwise. The dashed chip says so — "Saved to Today" or "Saved to Inbox". There is no separate list for later days; a task dated tomorrow is filed on Today and carries its day in `meta`. `hasLaterDay` is true when any date word other than today, tonight or اليوم is named, and is stored on the task as `later`, which keeps it out of the Today header count and stamp.

The destination is no longer only a hint. The "Add task" button, or the keyboard's submit key, creates the task through `addTask` in `src/state/store.tsx`: the `plain` tokens joined become the title (falling back to the raw text if nothing plain is left), the date, time and repeat chips become its `meta` (a date chip that reads exactly "Today" is dropped), and the project comes from the sheet's project chips, "No project" by default. Opened from a project page the sheet starts on that project and sends undated tasks to the list being viewed rather than Inbox — see [[Add Task Inside Project]]. The task then appears under that project's row on the destination tab — see [[Project Grouped Tasks]] — and as the first row of [[Recent]], which lists every task newest first. Tags are still highlighted and chipped but are not stored on the task.

Priority is stored, through the sheet's Priority chip group rather than straight from the parser: each `pri` chip now carries a level in its `value` (high for `!` / `!!!` / urgent / important / مهم / عاجل, medium for `!!`), and while the title or the When field holds a `pri` match the group reflects the strongest level found, otherwise None; once the user taps a priority chip that choice wins. The sheet also collects a description and a status, which the parser has no part in — see [[Task Details]].

The sheet's labelled WHEN field (placeholder "e.g. tomorrow 3pm") is a second input to the same parser: `parse(when, ar)` runs beside `parse(qa, ar)`, and the two chip lists are merged with the When chips first and exact duplicates removed, so "tomorrow" in both fields gives one chip and the day reads before the time. The combined list drives the chip row, the `meta` and the priority default, and a date in either text sends the task to Today and can flag it `later`. The When field is not highlighted as it is typed; only its chips show. Whatever words the parser does not recognise in it are kept verbatim (`freeWhen`, the plain tokens joined), so "Friday 3pm" keeps both: the text is appended to `meta`, the task is filed under Today whatever the undated list is, and it is flagged `later`, so it stays out of the Today header count and stamp. A When that holds only a time, such as "3pm", also files the task under Today rather than Inbox, and pressing return in the field submits.

All of this is the sheet's Task mode. The sheet now opens with a Task / Habit / Project switch, and the parser runs only on the task line and the When field — habit and project names are taken as typed. See [[Add Habits and Projects]]. The button is full width and reads "Add task" in this mode, and the four decorative tool icons that sat beside it (calendar, flag, hash, paperclip) have been removed.

The highlighting effect in the sheet is a transparent `BottomSheetTextInput` layered over an absolutely positioned coloured `Text` rebuilt from `parsed.tokens` on every keystroke.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Inbox]], [[Recent]]
- Features: [[Add Habits and Projects]], [[Task Details]], [[Add Task Inside Project]], [[Project Grouped Tasks]], [[Pen FAB Tab Bar]], [[Magic-plus drag insert]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Quick Add Sheet Shown On Launch]]
