# Device calendar overlay

Status: shipped
Summary: The phone's native calendar events shown read-only beside tasks — per-day dots on the month grid and an Events subsection under the selected day — plus the Settings toggle and Today strip.

## Details
Read-only infrastructure (via `expo-calendar`). `src/lib/deviceCalendar.ts` is a defensive wrapper exposing `getCalendarAccessStatus`, `requestCalendarAccess`, `listDeviceCalendars`, `listDeviceEvents` and the shared `DeviceEvent` type (`{ id, title, start, end, allDay, calendarId, color? }`); every native call is try/caught at this boundary and falls back to `[]` / `'denied'`. `src/hooks/useDeviceCalendarEvents(start: Date, end: Date)` is the shared hook both screens consume: it returns `[]` while disabled, checks permission on enable, requests access lazily only when status is undetermined, and re-fetches when the enabled flag, selected calendar ids, or the start/end epoch change. Two store prefs persist the state in the settings KV table (no schema bump): `deviceCalendarEnabled` and `deviceCalendarIds` (empty = all calendars), in `src/lib/db.ts` and `src/state/store.tsx`. [[Settings]] has a Calendar section (toggle that requests access on enable, plus a multi-select calendar-source picker with "All calendars"); [[Today]] shows a read-only events strip for today.

Month-grid rendering (`src/screens/CalendarScreen.tsx`, this workstream): the hook is called with the displayed month's `[firstDay 00:00, lastDay 23:59]` as two `Date` objects (memoised on year/month). Events are bucketed by day; days with at least one event get a small blue dot in the top-end corner of the cell (RTL-mirrored via `insetEnd`), kept visually distinct from the vertical tally strokes of [[Calendar Tally Marks]]. The selected day's list gains a read-only "Events" subsection (`t.events`) listing each event's title and time (`formatTime`, or `t.allDayEvent` for all-day); events are never draggable and have no checkbox. Everything degrades to nothing when the hook returns `[]` (disabled or permission denied) — the dots and the Events subsection simply don't render. The app never writes to the device calendar.

Note: the grid consumes `DeviceEvent` from `src/lib/deviceCalendar` (the hook does not re-export the type) and passes `Date` arguments, matching the hook's actual signature.

All-day events are timezone-normalized at the `deviceCalendar.ts` boundary (`normalizeAllDay`): a start/end landing exactly on UTC midnight — the Android all-day convention — is remapped to local midnight of that calendar date, so dots and list rows land on the intended day without shifting iOS local-midnight events. Day bucketing iterates each event's day-span clamped to the visible month (all-day ends treated as exclusive), so a multi-day event dots every day it covers and an event that began in a previous month still shows on the days it overlaps.

## Related
- Page: [[Calendar]], [[Settings]], [[Today]]
- Features: [[Persistence layer]], [[Calendar drag-to-schedule]], [[Calendar Tally Marks]]
