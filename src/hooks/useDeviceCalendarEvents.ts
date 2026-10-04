import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import {
  DeviceEvent,
  getCalendarAccessStatus,
  listDeviceEvents,
  requestCalendarAccess,
} from '../lib/deviceCalendar';

export function useDeviceCalendarEvents(start: Date, end: Date): DeviceEvent[] {
  const { deviceCalendarEnabled, deviceCalendarIds } = useStore();
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const startMs = start.getTime();
  const endMs = end.getTime();

  useEffect(() => {
    if (!deviceCalendarEnabled) {
      setEvents([]);
      return;
    }
    let mounted = true;
    (async () => {
      let status = await getCalendarAccessStatus();
      if (status === 'undetermined') {
        status = (await requestCalendarAccess()) ? 'granted' : 'denied';
      }
      if (!mounted) return;
      if (status !== 'granted') {
        setEvents([]);
        return;
      }
      const result = await listDeviceEvents(deviceCalendarIds, new Date(startMs), new Date(endMs));
      if (mounted) setEvents(result);
    })();
    return () => {
      mounted = false;
    };
  }, [deviceCalendarEnabled, deviceCalendarIds, startMs, endMs]);

  return events;
}
