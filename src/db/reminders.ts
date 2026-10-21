import { HOUR, MINUTE, addDays, startOfDay } from '../lib/date';

export const SNOOZE_TEN_MINUTES = 10 * MINUTE;
export const SNOOZE_ONE_HOUR = HOUR;

export const EVENING_REVIEW_HOUR = 20;
export const EVENING_REVIEW_MINUTE = 30;

export type SnoozeOffset = 'tenMinutes' | 'oneHour' | 'tomorrow';

export function snoozeUntil(offset: SnoozeOffset, from: number): number {
  if (offset === 'tenMinutes') return from + SNOOZE_TEN_MINUTES;
  if (offset === 'oneHour') return from + SNOOZE_ONE_HOUR;
  return startOfDay(addDays(from, 1));
}
