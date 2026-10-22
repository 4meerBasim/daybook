# Calendar Overflow Is Unreachable

Status: fixed
Found: `src/screens/CalendarScreen.tsx:41` — a `flex: 1` column with no scroll view inside it
Summary: [[Calendar]]'s selected-day list has no scroll view, so once a day holds about four tasks the rows past the fold are clipped by `Screen`'s `overflow: hidden` and cannot be reached at all.

## Details
Every other list in the app scrolls. [[Calendar]] alone renders its content into a fixed `flex: 1` column: the month header, the weekday row, the six-week grid, then the selected-day block. All four are naturally sized, and React Native defaults `flexShrink` to 0, so nothing compresses — the column simply grows past the viewport and [[Ledger Paper Chrome]]'s `overflow: 'hidden'` on `Screen` cuts it off.

The arithmetic on an 852pt viewport: header around 111, weekday row 24, grid 288, the day header one `unit` (56), then 56 per task row, plus the two trailing `EmptyRules`. That leaves room for roughly three rows before the fourth crosses the edge. A day with five tasks shows three of them and gives no indication the others exist — no scroll, no fade, no count mismatch, because the count in the day header is derived from the full `selItems` array and so still reads the true number.

This is not [[Stack Screens Ignore The Bottom Safe Area]]. That one costs a screen the last 34pt under the home indicator; this one makes rows unreachable outright, and adding a bottom inset would make it marginally worse rather than better. It was split out of [[Stack Screens Reserve Tab Bar Space]], which first mis-described it as an 84pt padding problem — the padding there was inert for exactly the same layout reason that makes this bug real.

The fix is bound up with the two other things still mock on this screen: the grid is a fixed thirty cells and the month and year are the literal strings `t.month` and `2026`. A real month grid is five or six rows depending on the month, which changes the available height for the list below it, so the scroll treatment and the real grid want deciding together.

Fixed together in `fix/calendar-real-month`. The header, weekday row and month grid stay fixed at the top of the `flex: 1` column; the selected-day section moved into a `ScrollView` that takes `flex: 1` of the space left below the grid, so it scrolls and the day header count can no longer outrun the visible rows. Because the real grid is five or six rows the space the scroll area gets varies, but `flex: 1` guarantees it is non-negative and the first list row sits at the top of the scrollable content, so a six-row month cannot clip it. No bottom inset was added — that stays with [[Stack Screens Ignore The Bottom Safe Area]].

## Related
- Page: [[Calendar]], [[Today]], [[Upcoming]]
- Features: [[Calendar Tally Marks]], [[Ledger Paper Chrome]], [[Offline First Local Store]]
- Bugs: [[Stack Screens Reserve Tab Bar Space]], [[Stack Screens Ignore The Bottom Safe Area]], [[Page Header Shows A Frozen Date]], [[Onboarding Shows On Every Launch]]
- Enhancements: [[Weekly Spread Review]], [[Day Capacity Budget]]
