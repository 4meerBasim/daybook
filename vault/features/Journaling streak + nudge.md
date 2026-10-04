# Journaling streak + nudge

Status: shipped
Summary: Tracks a consecutive-day writing streak and nudges the user to keep it alive.

## Details
`computeStreak` in `src/lib/day.ts` counts consecutive day keys that have an entry (today or, if today is empty, back from yesterday); `useStreak()` exposes it. Shown on [[Today]]'s daily-note card via `StreakTallyIcon` + the `dayStreak` label, dropping to the `streakNudge` line at zero, and on [[Profile]]. A daily writing reminder is scheduled through the [[Local notification module]] (`REMINDER_IDS.journal`) and toggled on [[Settings]].

## Related
- Page: [[Today]], [[Profile]], [[Settings]]
- Features: [[Daily note]], [[Local notification module]]
- Bugs: [[Reminders not reconciled or re-localized]]
- Enhancements: [[Karma and gamification]]
