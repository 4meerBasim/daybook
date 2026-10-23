import * as Notifications from 'expo-notifications';
import type { Strings } from '../i18n/strings';
import { FOCUS_MINUTES } from '../db/schema';

export const FOCUS_NOTIFICATION = 'focus-session';

export type Session = { taskId: string; startedAt: number; pausedAt: number | null };

export function elapsedMs(session: Session, now: number): number {
  return (session.pausedAt ?? now) - session.startedAt;
}

export function remainingSeconds(session: Session, now: number): number {
  const left = FOCUS_MINUTES * 60 - Math.floor(elapsedMs(session, now) / 1000);
  return Math.max(left, 0);
}

export function clock(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export async function showSession(
  title: string,
  session: Session,
  now: number,
  t: Strings
): Promise<void> {
  const left = remainingSeconds(session, now);
  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_NOTIFICATION,
    content: {
      title,
      body: session.pausedAt
        ? `${t.pause} · ${clock(left)}`
        : t.focusLeft.replace('{clock}', clock(left)),
      sticky: true,
      data: { taskId: session.taskId, insistent: false },
    },
    trigger: null,
  });
}

export async function clearSession(): Promise<void> {
  await Notifications.dismissNotificationAsync(FOCUS_NOTIFICATION).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(FOCUS_NOTIFICATION).catch(
    () => undefined
  );
}
