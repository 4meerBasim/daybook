import { useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useStore, useTasks } from '../state/store';
import {
  DailyTime,
  DesiredDaily,
  DesiredDate,
  REMINDER_IDS,
  reconcileReminders,
  taskReminderId,
} from '../lib/notifications';

function parseTime(time: string): DailyTime {
  const [h, m] = time.split(':');
  return { hour: Number(h), minute: Number(m) };
}

export function useReminderSync(): void {
  const { t, lang } = useTheme();
  const { reminderEnabled, reminderTime, onThisDayEnabled, done } = useStore();
  const tasks = useTasks();

  const taskSignature = tasks
    .filter((task) => task.reminderAt != null)
    .map((task) => `${task.id}:${task.reminderAt}:${done[task.id] ? 1 : 0}:${task.title}`)
    .join('|');

  useEffect(() => {
    const dailies: DesiredDaily[] = [];
    if (reminderEnabled) {
      dailies.push({
        id: REMINDER_IDS.journal,
        time: parseTime(reminderTime),
        content: { title: t.journalReminderTitle, body: t.journalReminderBody },
      });
    }
    if (onThisDayEnabled) {
      dailies.push({
        id: REMINDER_IDS.onThisDay,
        time: parseTime(reminderTime),
        content: { title: t.onThisDay, body: t.onThisDayBody },
      });
    }

    const now = Date.now();
    const dates: DesiredDate[] = tasks
      .filter((task) => task.reminderAt != null && (task.reminderAt as number) > now && !done[task.id])
      .map((task) => ({
        id: taskReminderId(task.id),
        when: new Date(task.reminderAt as number),
        content: { title: t.taskDue, body: task.title },
      }));

    void reconcileReminders(dailies, dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, reminderEnabled, reminderTime, onThisDayEnabled, taskSignature]);
}
