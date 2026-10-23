# Quick Add Sheet

Route: no stack route — a `@gorhom/bottom-sheet` rendered inside `MainTabs`, opened by the `adding` flag
Summary: The capture sheet behind the bar's Add item: a growing field that is syntax-highlighted live, with parsed chips and a destination hint underneath.

## Related
- Connects to: [[Main Tabs]] — opened by the Add item in the bar from any pane and closed by pan-down or backdrop tap, [[Today]], [[Upcoming]], [[Profile]]
- Features: [[Natural Language Quick Add]], [[Offline First Local Store]], [[Projects As A Real Entity]], [[Glass Tab Bar]], [[Pen FAB]], [[Expanding Search Field]] — the sibling surface sharing the bar, [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]], [[Ledger Paper Chrome]], [[Day Capacity Budget]], [[Inbox Triage Chips]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Bottom Sheet Text Input Crashes On Web]], [[Quick Add Highlight Drifts From The Caret]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Voice Brain Dump Capture]], [[System Capture Entry Points]]

## Notes
`src/screens/QuickAddSheet.tsx`. The visible text is a coloured `Text` built from the parser's tokens with a transparent `BottomSheetTextInput` laid over it, which is how the underlining follows typing.

The dashed chip at the end of the chip row reads from `parsed.hasDate` and now says "Saved to Upcoming" / "يُحفظ في القادم" or "No date" / "بلا تاريخ". It used to say "Saved to Inbox" on the false branch. The copy was changed with the Inbox's removal and is accurate as far as it goes, but only one branch still names a destination — a dateless capture is inserted somewhere no screen reads, which the chip does not say. See [[Undated Unassigned Tasks Have No Screen]].

Opened by the Add item in the bar rather than by a raised pen. The affordance changed; this sheet did not — `onAdd` is the same call, the medium haptic still fires before it. See [[Pen FAB]].

The field is multiline and grows. The mirror is the layer in normal flow and the input is the one absolutely filled over it, which is the opposite of how it started: with the input in flow and single-line it scrolled sideways past the field width and left the caret behind the highlight — [[Quick Add Highlight Drifts From The Caret]]. With the mirror driving the height the input's box always equals its own content, so `scrollEnabled={false}` costs nothing and neither axis can move.

The chips are the shared `Chip` now, so they pick up the Arabic padding widening from [[In-App RTL and Arabic Typography]] like every other chip.

Add now commits. `onAdd` runs `draft()` from `src/lib/parse.ts` over the same parse output the highlighting uses, inserts the task through the store, clears the draft and closes the sheet — see [[Quick Add Does Not Create Tasks]] for what it resolves and what it deliberately leaves in the title. Hashtags are no longer part of that leftover: `draft()` splits them into the task's `tags` column and the stored title comes out clean, which is what lets a project describe itself by its tags — see [[Projects As A Real Entity]]. The insert matches the chip exactly: a due date is written only when `hasDate` is true, so a bare time with no day is stored undated.

The draft starts empty rather than pre-filled, and only Add clears it — a sheet dismissed by pan-down or backdrop tap keeps what was typed.

The four tool buttons (calendar, flag, hash, paperclip) remain inert, as the mock draws them.
