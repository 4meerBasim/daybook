# Daily writing prompts

Status: shipped
Summary: Offers a rotating writing prompt to seed the day's entry when nothing is captured yet.

## Details
`src/data/prompts.ts` holds 15 EN and 15 AR prompts; `promptForDate` / `todaysPrompt` pick one by day-of-year, so it rotates daily and is stable within a day. Shown on [[Today]]'s daily-note card when the day's entry is empty, and inside the [[Entry Composer]] (prompt line plus a "Use this prompt" button) for a new, empty entry.

## Related
- Page: [[Today]], [[Entry Composer]]
- Features: [[Daily note]], [[Entry templates]]
- Enhancements: [[AI writing assist]]
