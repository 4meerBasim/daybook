# Karma and gamification

Status: shipped
Summary: A derived productivity score and level, computed from completed tasks, habit and focus minutes, and the journaling streak, shown on Profile.

## Details
Implemented as a pure selector `useKarma()` in `src/state/store.tsx` — no persisted running counter, so there is nothing to double-count or migrate. Points = completed tasks (the `done` map) × 10 + habit-session minutes + focus-session minutes + journaling streak × 5. Levels come from `KARMA_THRESHOLDS` (`[0, 100, 300, 700, 1500, 3000]`) mapped to six level names in `src/i18n/strings.ts` (`karmaLevels`, EN + AR). `todayGain` sums today's completed tasks, focus and habit minutes. [[Profile]] renders the level name, level number and points, localized and themed. Feeds on [[Habit Session Timer]], [[Focus stats]] and [[Journaling streak + nudge]].

## Related
- Page: [[Profile]], [[Habit]]
- Features: [[Focus stats]], [[Habit Session Timer]], [[Journaling streak + nudge]]
