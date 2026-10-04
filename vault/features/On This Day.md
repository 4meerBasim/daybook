# On This Day

Status: shipped
Summary: Resurfaces entries written on the same date in previous months or years.

## Details
`useOnThisDay()` in `src/state/store.tsx` matches past entries by `monthDayKey` (`src/lib/day.ts`). On [[Today]] the section renders only when it is non-empty — a `SectionLabel` plus one row per memory, labelled with `relativeYears`, each opening the memory in the [[Entry Composer]]. Resurfaced entries also appear in [[Timeline and map view]]. An optional daily "On this day" notification is scheduled through the [[Local notification module]] (`REMINDER_IDS.onThisDay`) and toggled on [[Settings]].

## Related
- Page: [[Today]], [[Timeline and Map]], [[Settings]]
- Features: [[Daily note]], [[Timeline and map view]], [[Local notification module]]
