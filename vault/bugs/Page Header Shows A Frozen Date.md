# Page Header Shows A Frozen Date

Status: fixed
Found: `src/i18n/strings.ts`, the `dateLine` key, rendered by [[Today]] and [[Page Closed]]
Summary: Today's header read "Thursday, 18 September" as a literal string while the rest of the app followed the real clock, so the app contradicted itself on screen.

## Details
The date line was an i18n string, one of the mock's literals carried straight into the build. That was consistent while everything else was literal too. It stopped being consistent when [[Offline First Local Store]] landed: seed due dates became relative to the first run, [[Calendar]] began underlining the real today and initialising `sel` to it, and [[Today]] started deriving "Yesterday" from real epoch milliseconds. The header above those rows still insisted it was 18 September.

`longDate(ts, t)` in `src/lib/date.ts` builds the line instead, from `weekdays`, `months` and `dateComma` in `src/i18n/strings.ts`. [[Today]] passes `Date.now()`; [[Page Closed]] passes the same and also takes its wax stamp caption from `stamped(now)`, which was a frozen `18 · 09 · 2026 — 17:42`.

`weekdays` follows the same first-day-of-week ordering as the existing `wd` initials — Monday first in English, Saturday first in Arabic — and `firstWeekday` maps `Date.getDay()` onto that ordering, so the two arrays stay parallel and either can be checked against the other. Arabic gets real Arabic weekday and month names, its own comma, and no italics, since `displayFamily` already ignores the italic flag for Arabic. Numerals stay Western, which is the design's default.

The `dateLine` key is gone rather than left orphaned.

What is still literal, deliberately: [[Calendar]]'s month title and year, and its thirty-cell grid. Making the title real while the grid is fixed at thirty days would trade one contradiction for a worse one, so both wait for the calendar to be built out. `months` now exists for that work.

## Related
- Feature: [[Collapsing Page Header]], [[Offline First Local Store]], [[In-App RTL and Arabic Typography]], [[Wax Page Closed Stamp]]
- Page: [[Today]], [[Page Closed]], [[Calendar]]
- Bugs: [[Calendar Overflow Is Unreachable]]
