# Ink Decay and Task Retirement

Status: planned
Summary: Untouched tasks fade over time, and past a carry threshold the app forces one choice — do it, schedule it, or send it to Someday.

## Notes
A self-collecting backlog. The list cleans itself, so opening the app never feels like opening a bill the user cannot pay. Visually it is the cheapest possible feature in this design language: interpolate the row's ink toward the paper colour as the task ages, using the existing palette rather than any new chrome.

The retirement prompt is the part that matters. Past the threshold the task stops being offered silently and asks once, with three outcomes, one tap each.

Open decisions:

- Fade needs an age. [[Offline First Local Store]] now persists `createdAt` on every task, so the age is readable; what is undecided is the curve and the threshold, not where the number comes from.
- Carry counts come from [[Closing the Page Ritual]]; without that pass there is nothing to count, and no column holds one.
- Contrast floor. Faded ink must stay legible in both [[Light and Dark Paper Palettes]] and must not drop below the accessible minimum, so the fade should bottom out well before it disappears — and probably be defeatable in [[Settings]] next to [[Reduced Motion Mode]].
- "Someday" has nothing behind it. It existed as a literal section label on the Inbox screen with no backing list and no column, and that screen and the `someday` string are both gone now — the same gap [[Inbox Triage Chips]] runs into, and the third outcome of the retirement prompt still has nowhere to send a task.
- Undated tasks are now visible rather than invisible: [[Undated Unassigned Tasks Have No Screen]] is fixed and they live on the [[Unfiled]] screen, so "send to Someday" no longer means "delete quietly" — though Someday itself still needs its own backing, per the point above.

## Related
- Page: [[Today]], [[Upcoming]], [[Settings]], [[Profile]]
- Features: [[Offline First Local Store]], [[Ink Strike-Through Completion]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Closing the Page Ritual]], [[Inbox Triage Chips]]
