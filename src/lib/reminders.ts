import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Strings } from '../i18n/strings';
import { rowTitle, type TaskRow } from '../db/schema';

export const INSISTENT_CHANNEL = 'insistent';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function askPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function prepareChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(INSISTENT_CHANNEL, {
    name: 'Insistent reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

function trigger(at: number): Notifications.NotificationTriggerInput {
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) };
}

export async function reschedule(tasks: TaskRow[], now: number, t: Strings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const task of tasks) {
    const title = rowTitle(task, t);

    if (task.reminderAt !== null && task.reminderAt > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: task.insistent ? t.insistentBody : t.reminderBody,
          data: { taskId: task.id, insistent: !!task.insistent },
          ...(task.insistent ? { sticky: true } : null),
        },
        identifier: `task-${task.id}`,
        trigger: trigger(task.reminderAt),
      });
    }

    if (task.blockedBy !== null && task.nudgeAt !== null && task.nudgeAt > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: `${t.waitingOn} ${task.blockedBy}`,
          data: { taskId: task.id, insistent: false },
        },
        identifier: `nudge-${task.id}`,
        trigger: trigger(task.nudgeAt),
      });
    }
  }
}
