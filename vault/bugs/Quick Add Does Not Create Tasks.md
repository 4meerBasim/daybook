# Quick Add Does Not Create Tasks

Status: fixed
Found: `src/screens/QuickAddSheet.tsx:204`
Summary: The Add button in the quick-add sheet had no `onPress`, so a composed task was parsed and previewed but never committed to any list.

## Details
As found:

The sheet parses the query live and shows the destination chip ("Saved to Upcoming" / "Saved to Inbox"), but the dark Add `Pressable` at the bottom right declares only `accessibilityRole`, `accessibilityLabel` and styling — no handler. The four tool buttons beside it (calendar, flag, hash, paperclip) are in the same state.

Consequences:

- Nothing is ever appended to [[Today]], the then-Upcoming tab or [[Inbox]] — those lists render fixed content from `src/data/seed.ts`
- The sheet does not close on submit, since `onClose` is only reachable via pan-down or backdrop tap
- `qa` in `src/state/store.tsx` is seeded with `'Call dentist tomorrow 3pm #health'` and never cleared, so reopening the sheet shows the previous text rather than an empty line

The parsing side is complete and correct — see [[Natural Language Quick Add]]. What is missing is a task collection in the store that lists read from, plus an `onPress` that appends the parsed result and calls `onClose`.

Worth confirming with the user whether this was left out deliberately for the design transcription pass.

Fixed as part of [[Project Grouped Tasks]], which supplied the missing task collection. `src/state/store.tsx` now holds an `added` array with an `addTask` action, and every list reads seed plus added tasks through `useTasks()`. In `src/screens/QuickAddSheet.tsx` the Add button and the input's `onSubmitEditing` both call `submit`, which builds the title from the plain tokens, took the list from the parser as it then stood — `today` when `isToday` (added to `src/lib/parse.ts` for this, set by today / tonight / اليوم), `upcoming` when `hasDate`, otherwise `inbox` — attaches the project picked from the new row of project chips, calls `addTask`, clears `qa` and closes the sheet. The destination chip gained a "Saved to Today" state to match.

The routing was simplified later, when the Upcoming tab became [[Recent]]: the `upcoming` list and `isToday` were removed, any dated task is filed on `today` (flagged `later` from `hasLaterDay` when the day is not today) and an undated one on `inbox`, and the chip reads "Saved to Today" or "Saved to Inbox". The fix itself is unchanged, and a task added this way is the first row on [[Recent]].

Still open after the fix: the four tool buttons remain decorative, `qa` is still seeded with the dentist example on first launch, added tasks are held in memory only, and tags and priority are parsed and shown as chips but not stored on the task (date, time and repeat chips are kept as the task's `meta` text).

## Related
- Feature: [[Natural Language Quick Add]], [[Project Grouped Tasks]], [[Pen FAB Tab Bar]]
- Page: [[Quick Add Sheet]], [[Today]], [[Recent]], [[Inbox]]
