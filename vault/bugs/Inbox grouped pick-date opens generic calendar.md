# Inbox grouped pick-date opens generic calendar

Status: fixed
Found: src/screens/InboxScreen.tsx (grouped mode onPickDate)
Fixed: grouped rows now use a `pickId` state + task-bound `DueDatePickerModal` (matching Recent/Project); the `navigation.navigate('Calendar')` pick-date path was removed. The a11y `pickDate` action opens the same modal.
Summary: In the Inbox category-grouped view, the swipe "pick date" action opens the generic Calendar screen instead of the task-bound due-date picker used elsewhere.

## Details
Recent and Project rows open `DueDatePickerModal` bound to the task and set `dueAt` directly. The Inbox grouped rows still call `navigation.navigate('Calendar')`, so picking a date there does not set the task's due date. Introduced when the category grouping was added in Phase 3. Fix: give the grouped rows a `pickId` state plus `DueDatePickerModal`, matching Recent and Project.

## Related
- Feature: [[Due-date picker]]
- Page: [[Inbox]]
