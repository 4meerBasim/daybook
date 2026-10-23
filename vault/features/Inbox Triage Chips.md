# Inbox Triage Chips

Status: shipped
Summary: Every undated capture on the Unfiled page carries one-tap Today and Someday chips, and Someday is now a real column rather than a label.

## Details
Rebased onto [[Unfiled]], which is the surface the original Inbox screen left behind. The chips the mock drew as inert `div`s are real `Pressable`s with labels and handlers.

**Someday got a backing.** The note's three candidate products were a nullable field, a far-future due date, and a separate list. Schema v5 takes the first: `somedayAt INTEGER` on `tasks`, with a partial index. A far-future `dueDate` would have put shelved work on [[Calendar]] and in [[Upcoming]], which is the opposite of shelving it; a separate table would have duplicated every column for one flag.

`selectUnfiled` and `selectUndated` both exclude `somedayAt IS NOT NULL`, so shelving takes a row out of the capture pile and out of [[Day Capacity Budget]]'s "plan tomorrow" candidates. `selectSomeday` lists them newest-shelved-first in their own section on the same screen.

**The chips.** `TriageChip`, with `TaskRow` gaining an `actions` slot so the chips sit in the row rather than needing a parallel row component:

- **Today** writes `dueDate` through `reschedule`, so the row moves to [[Today]].
- **Someday** writes `somedayAt` and clears `dueDate`.
- A shelved row carries one chip back: **Today** clears `somedayAt` and dates it.

Both are mirrored as `accessibilityActions` on the row alongside the swipe actions, so the whole triage is reachable with TalkBack and VoiceOver — which is what the briefly-`Pressable`-with-no-`onPress` version got wrong.

**What feedback a triaged row gets as it leaves** — the question the mock did not answer — is [[Lift The Ink]]. Both chips raise the slip, Someday under a new `shelved` reversal that restores the prior `dueDate`. The row leaving the list is the confirmation; the slip is the way back.

**Someday is also a close outcome.** [[Closing the Page Ritual]]'s Move sheet gains it as a third destination, as an `Outcome` rather than an immediate write — every other decision in the ritual defers to the stamp, and one that committed on tap would survive backing out of the screen. `closed_days` gains a `shelved` count and [[Page Closed]] reports it.

## Decisions taken
- **Long-press stays [[Task Detail]]; project filing moved there.** The original design put the project picker on the row's long-press, but long-press means "open the task" on every other list in the app, and [[Unfiled]] would have been the one exception. Instead [[Task Detail]] gained a PROJECT field that opens [[Project Picker]] — which is where a task's project belongs anyway, and the screen was already showing the project name with no way to change it. [[Project Picker]] has two callers again.
- **Two chips, not three.** A third "File" chip plus the title and the checkbox does not fit a 56pt row at an accessible tap size.

## Related
- Page: [[Unfiled]], [[Today]], [[Quick Add Sheet]], [[Project Picker]], [[Task Detail]], [[Close Page]]
- Features: [[Offline First Local Store]], [[Projects As A Real Entity]], [[Ledger Paper Chrome]], [[Natural Language Quick Add]], [[Lift The Ink]], [[Closing the Page Ritual]], [[Day Capacity Budget]]
- Bugs: [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Ink Decay and Task Retirement]]
