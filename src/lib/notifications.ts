import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications');

// Expo Go on Android no longer ships expo-notifications, and loading it there fails at startup.
const isExpoGoAndroid =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications: NotificationsModule | null =
  Platform.OS === 'web' || isExpoGoAndroid ? null : require('expo-notifications');

export type DailyTime = { hour: number; minute: number };

export const REMINDER_IDS: { journal: string; onThisDay: string } = {
  journal: 'journal-daily-reminder',
  onThisDay: 'on-this-day-reminder',
};

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(
  id: string,
  time: DailyTime,
  content: { title: string; body: string },
): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
    await cancelReminder(id);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title: content.title, body: content.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminder(id: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore: cancelling an unknown or already-removed id is a no-op
  }
}

export async function isReminderScheduled(id: string): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some((request) => request.identifier === id);
  } catch {
    return false;
  }
}

export const TASK_REMINDER_PREFIX = 'task-';

export function taskReminderId(taskId: string): string {
  return `${TASK_REMINDER_PREFIX}${taskId}`;
}

export type DesiredDaily = {
  id: string;
  time: DailyTime;
  content: { title: string; body: string };
};

export type DesiredDate = {
  id: string;
  when: Date;
  content: { title: string; body: string };
};

export async function scheduleTaskReminder(
  taskId: string,
  when: Date,
  content: { title: string; body: string },
): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
    const id = taskReminderId(taskId);
    if (when.getTime() <= Date.now()) {
      await cancelReminder(id);
      return false;
    }
    await cancelReminder(id);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title: content.title, body: content.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  await cancelReminder(taskReminderId(taskId));
}

export async function reconcileReminders(
  dailies: DesiredDaily[],
  dates: DesiredDate[],
): Promise<void> {
  if (!Notifications) return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const now = Date.now();
    const desiredIds = new Set<string>();

    for (const daily of dailies) {
      desiredIds.add(daily.id);
      try {
        await Notifications.cancelScheduledNotificationAsync(daily.id);
        await Notifications.scheduleNotificationAsync({
          identifier: daily.id,
          content: { title: daily.content.title, body: daily.content.body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: daily.time.hour,
            minute: daily.time.minute,
          },
        });
      } catch {
        // ignore a single failed (re)schedule so the rest of the reconcile proceeds
      }
    }

    for (const date of dates) {
      if (date.when.getTime() <= now) {
        await cancelReminder(date.id);
        continue;
      }
      desiredIds.add(date.id);
      try {
        await Notifications.cancelScheduledNotificationAsync(date.id);
        await Notifications.scheduleNotificationAsync({
          identifier: date.id,
          content: { title: date.content.title, body: date.content.body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: date.when,
          },
        });
      } catch {
        // ignore a single failed (re)schedule so the rest of the reconcile proceeds
      }
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of scheduled) {
      const id = request.identifier;
      const owned =
        id === REMINDER_IDS.journal ||
        id === REMINDER_IDS.onThisDay ||
        id.startsWith(TASK_REMINDER_PREFIX);
      if (owned && !desiredIds.has(id)) {
        await cancelReminder(id);
      }
    }
  } catch {
    // ignore: reconcile is best-effort and must never throw into the caller
  }
}
