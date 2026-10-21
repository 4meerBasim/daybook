# Quick Add Does Not Create Tasks

Status: fixed
Found: `src/screens/QuickAddSheet.tsx:180`
Summary: The Add button in the quick-add sheet had no `onPress`, so a composed task was parsed and previewed but never committed to any list.

## Details
The sheet parsed the query live and showed the destination chip ("Saved to Upcoming" / "Saved to Inbox", since reworded to "No date"), but the dark Add `Pressable` at the bottom of the row declared only `accessibilityRole`, `accessibilityLabel` and styling — no handler. Its `onPress` was `onClose`, so submitting was indistinguishable from dismissing.

Three symptoms, all gone:

- Nothing was ever appended to [[Today]], [[Upcoming]] or the Inbox — those lists rendered fixed content from the old `src/data/seed.ts`
- The sheet did not close on submit in any meaningful sense, since there was nothing to submit
- `qa` in `src/state/store.tsx` was seeded with `'Call dentist tomorrow 3pm #health'` and never cleared, so reopening the sheet showed the previous text rather than an empty line

Fixed by `draft()` in `src/lib/parse.ts` plus `create` on the store. `draft()` consumes the parser's existing token stream and resolves it into a real task: the plain runs become the title, a date token resolves against the current date (today, tonight, tomorrow, next week, next monday/friday, and the Arabic غداً / اليوم), and a time token refines the hour. `onAdd` in the sheet inserts it, clears `qa` and closes.

Two deliberate choices:

- A due date is only written when `hasDate` is already true, which is exactly the condition the dashed destination chip reads. A bare time with no day is still inserted undated, matching what the sheet promised the user — though with the Inbox gone there is no longer a list for it to land on, which is a separate defect: [[Undated Unassigned Tasks Have No Screen]].
- Repeat tokens stay inside the title, because no column in [[Offline First Local Store]] captures a recurrence yet. Dropping them would lose what the user typed. Tags were in the same position — `#health` read as part of the title — until `tasks.tags` landed with [[Projects As A Real Entity]]; hashtags are now lifted into that column and the stored title comes out clean.

`qa` now starts empty. A draft abandoned by pan-down or backdrop tap is kept on purpose — only Add clears it.

The four tool buttons beside Add (calendar, flag, hash, paperclip) are still inert, as the mock draws them. The parsing side was always complete — see [[Natural Language Quick Add]].

## Related
- Feature: [[Natural Language Quick Add]], [[Glass Tab Bar]], [[Offline First Local Store]], [[Projects As A Real Entity]]
- Page: [[Quick Add Sheet]], [[Today]], [[Upcoming]]
- Bugs: [[Bottom Sheet Text Input Crashes On Web]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Voice Brain Dump Capture]], [[System Capture Entry Points]]
