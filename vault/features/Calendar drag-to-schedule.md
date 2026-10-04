# Calendar drag-to-schedule

Status: shipped
Summary: Long-press and drag a task — from the selected day's list or the unscheduled tray — onto any day to schedule it, with a non-drag screen-reader fallback.

## Details
`src/screens/CalendarScreen.tsx`. Built on the same recipe as the [[Eisenhower matrix]]: Gesture Handler v2 builder API, Reanimated shared values, and `scheduleOnRN` (never `runOnJS`) for the New Architecture.

Each draggable task is wrapped in an internal `DraggableTask` component carrying `Gesture.Exclusive(pan, tap)` — `tap` opens the task in `TaskDetail`, `pan` activates after a long press (190ms, 150ms under reduced motion). On start it lifts a floating overlay chip (absolutely positioned, `pointerEvents="none"`, `importantForAccessibility="no-hide-descendants"`, scaled 1.04 unless reduced) that tracks the finger via `dragX`/`dragY`. Day cells are measured with `ref` + `onLayout` + `measureInWindow` into a `useSharedValue<DayRect[]>` (each rect tagged with its day number); the set is re-measured on drag start so a scrolled layout stays accurate. `onEnd` hit-tests `absoluteX/absoluteY` against those rects and, on a hit, calls `scheduleOnRN(drop, dayNumber)`.

Scheduling (`schedule(task, y, m, day)`) preserves the dragged task's existing time-of-day (hours/minutes/seconds from its `dueAt`) or defaults to 09:00 — the app's preset morning time — and builds the epoch from the displayed month's year/month. Seed tasks (id not starting with `a`) are promoted with `ensureTask(task)` before `setDue(id, epoch, false)`, exactly as Eisenhower/Recent do. Reminders follow: if the task had both a prior `dueAt` and a non-null `reminderAt`, the reminder is shifted by the same delta via `setTaskReminder`, mirroring the recurrence branch in `toggle()`; `useReminderSync` then reconciles notifications. See [[Local reminders]].

The unscheduled tray (`dueAt == null`, not done) is a horizontal strip below the ledger; its chips are draggable with the same gesture and default to 09:00. Accessibility fallback: every chip exposes `accessibilityActions` for "Schedule on Today / Tomorrow / Next week" (built from `t.scheduleOnDay`, reusing `startOfToday`/`tomorrowMorning`/`nextWeek`) handled by `onAccessibilityAction` through the same `schedule` path, plus an "Open task" (`t.openTask`) action that routes to `TaskDetail` so screen-reader users can open a task the tap gesture would otherwise be their only path to, and an `accessibilityHint` of `t.dragTaskHint`. Haptics and overlay scale respect [[Reduced Motion Mode]].

## Related
- Page: [[Calendar]]
- Features: [[Due-date picker]], [[Local reminders]], [[Eisenhower matrix]], [[Reduced Motion Mode]], [[Calendar Tally Marks]], [[In-App RTL and Arabic Typography]], [[Magic-plus drag insert]]
