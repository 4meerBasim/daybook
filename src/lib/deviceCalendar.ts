import * as Calendar from 'expo-calendar';

export type DeviceEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay: boolean;
  calendarId: string;
  color?: string;
};

export async function getCalendarAccessStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const res = await Calendar.getCalendarPermissions();
    const status = String(res.status);
    if (res.granted || status === 'granted') return 'granted';
    if (status === 'undetermined') return 'undetermined';
    return 'denied';
  } catch {
    return 'denied';
  }
}

export async function requestCalendarAccess(): Promise<boolean> {
  try {
    const res = await Calendar.requestCalendarPermissions();
    return !!res.granted;
  } catch {
    return false;
  }
}

export async function listDeviceCalendars(): Promise<{ id: string; title: string; color?: string }[]> {
  try {
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    if (!calendars) return [];
    return calendars.map((cal) => ({ id: cal.id, title: cal.title, color: cal.color }));
  } catch {
    return [];
  }
}

function normalizeAllDay(ts: number): number {
  const d = new Date(ts);
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
  }
  return ts;
}

export async function listDeviceEvents(
  calendarIds: string[],
  start: Date,
  end: Date
): Promise<DeviceEvent[]> {
  try {
    const calendars = (await Calendar.getCalendars(Calendar.EntityTypes.EVENT)) ?? [];
    const colorById = new Map<string, string | undefined>();
    for (const cal of calendars) colorById.set(cal.id, cal.color);

    const ids = calendarIds.length ? calendarIds : calendars.map((cal) => cal.id);
    if (!ids.length) return [];

    const events = (await Calendar.listEvents(ids, start, end)) ?? [];
    return events
      .map((ev) => {
        const allDay = !!ev.allDay;
        const rawStart = new Date(ev.startDate).getTime();
        const rawEnd = new Date(ev.endDate).getTime();
        return {
          id: ev.id,
          title: ev.title,
          start: allDay ? normalizeAllDay(rawStart) : rawStart,
          end: allDay ? normalizeAllDay(rawEnd) : rawEnd,
          allDay,
          calendarId: ev.calendarId,
          color: colorById.get(ev.calendarId),
        };
      })
      .sort((a, b) => a.start - b.start);
  } catch {
    return [];
  }
}
