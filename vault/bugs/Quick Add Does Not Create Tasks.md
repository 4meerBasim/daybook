# Quick Add Does Not Create Tasks

Status: not-fixed
Found: `src/screens/QuickAddSheet.tsx:204`
Summary: The Add button in the quick-add sheet has no `onPress`, so a composed task is parsed and previewed but never committed to any list.

## Details
The sheet parses the query live and shows the destination chip ("Saved to Upcoming" / "Saved to Inbox"), but the dark Add `Pressable` at the bottom right declares only `accessibilityRole`, `accessibilityLabel` and styling — no handler. The four tool buttons beside it (calendar, flag, hash, paperclip) are in the same state.

Consequences:

- Nothing is ever appended to [[Today]], [[Upcoming]] or [[Inbox]] — those lists render fixed content from `src/data/seed.ts`
- The sheet does not close on submit, since `onClose` is only reachable via pan-down or backdrop tap
- `qa` in `src/state/store.tsx` is seeded with `'Call dentist tomorrow 3pm #health'` and never cleared, so reopening the sheet shows the previous text rather than an empty line

The parsing side is complete and correct — see [[Natural Language Quick Add]]. What is missing is a task collection in the store that lists read from, plus an `onPress` that appends the parsed result and calls `onClose`.

Worth confirming with the user whether this was left out deliberately for the design transcription pass.

## Related
- Feature: [[Natural Language Quick Add]], [[Pen FAB Tab Bar]]
- Page: [[Quick Add Sheet]], [[Today]], [[Upcoming]], [[Inbox]]
