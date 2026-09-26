# Ink Decay and Task Retirement

Status: planned
Summary: Untouched tasks fade over time, and past a carry threshold the app forces one choice — do it, schedule it, or send it to Someday.

## Notes
A self-collecting backlog. The list cleans itself, so opening the app never feels like opening a bill the user cannot pay. Visually it is the cheapest possible feature in this design language: interpolate the row's ink toward the paper colour as the task ages, using the existing palette rather than any new chrome.

The retirement prompt is the part that matters. Past the threshold the task stops being offered silently and asks once, with three outcomes, one tap each.

Open decisions:

- Fade needs an age, which needs a created-at timestamp and persistence — see [[Offline First Local Store]].
- Carry counts come from [[Closing the Page Ritual]]; without that pass there is nothing to count.
- Contrast floor. Faded ink must stay legible in both [[Light and Dark Paper Palettes]] and must not drop below the accessible minimum, so the fade should bottom out well before it disappears — and probably be defeatable in [[Settings]] next to [[Reduced Motion Mode]].
- "Someday" already exists as an [[Inbox]] section label, but it is a literal string with no backing list — the same gap [[Inbox Triage Chips]] runs into.

## Related
- Page: [[Today]], [[Inbox]], [[Upcoming]]
- Features: [[Ink Strike-Through Completion]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]]
- Enhancements: [[Closing the Page Ritual]], [[Inbox Triage Chips]], [[Offline First Local Store]]
