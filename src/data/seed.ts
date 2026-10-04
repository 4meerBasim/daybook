import { Palette } from '../theme/palette';
import { Strings } from '../i18n/strings';
import { JournalIconKey } from '../components/Icon';
import type { RecurrenceRule } from '../lib/recurrence';

export type ListKey = 'today' | 'inbox';

export type Priority = 'none' | 'low' | 'medium' | 'high';

export type Status = 'todo' | 'doing' | 'waiting';

export type ColorKey = 'blue' | 'och' | 'moss' | 'ver';

export type Project = { id: string; name: string; color: keyof Palette };

export type Task = {
  id: string;
  title: string;
  meta: string;
  list: ListKey;
  projectId: string | null;
  over?: boolean;
  later?: boolean;
  desc?: string;
  priority?: Priority;
  status?: Status;
  tags?: string[];
  dueAt?: number | null;
  reminderAt?: number | null;
  recurrence?: RecurrenceRule | null;
  color?: ColorKey | null;
  urgent?: boolean;
  important?: boolean;
  someday?: boolean;
};

export type Subtask = { id: string; taskId: string; title: string; done: boolean; position: number };

export type Attachment = {
  id: string;
  taskId: string | null;
  entryId: string | null;
  kind: 'photo' | 'audio';
  uri: string;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  createdAt: number;
};

export type SmartListRule = {
  tags?: string[];
  due?: 'today' | 'overdue' | 'week' | 'none';
  priority?: ('low' | 'medium' | 'high')[];
  projectId?: string | null;
  color?: ColorKey[];
  someday?: boolean;
};

export type SmartList = {
  id: string;
  name: string;
  rules: SmartListRule;
  position: number;
  builtin?: boolean;
};

export type Journal = { id: string; name: string; color: keyof Palette; icon: JournalIconKey };

export type Entry = {
  id: string;
  journalId: string;
  day: string;
  title: string;
  body: string;
  templateId: string | null;
  createdAt: number;
  placeName: string | null;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  weatherCode: number | null;
};

export type EntryTemplate = { id: string; name: string; body: string; builtIn: boolean };

export const DEFAULT_JOURNAL_ID = 'default';

export function defaultJournal(t: Strings): Journal {
  return { id: DEFAULT_JOURNAL_ID, name: t.defaultJournal, color: 'blue', icon: 'book' };
}

export function builtinTemplates(t: Strings): EntryTemplate[] {
  return [
    { id: 'tpl-gratitude', name: t.tplGratitude, body: t.tplGratitudeBody, builtIn: true },
    { id: 'tpl-review', name: t.tplDailyReview, body: t.tplDailyReviewBody, builtIn: true },
    { id: 'tpl-weekly', name: t.tplWeekly, body: t.tplWeeklyBody, builtIn: true },
  ];
}

export function projects(t: Strings): Project[] {
  return [
    { id: 'studio', name: t.studio, color: 'blue' },
    { id: 'work', name: t.work, color: 'och' },
    { id: 'home', name: t.home, color: 'moss' },
  ];
}

export function tasks(t: Strings, ar: boolean): Task[] {
  return [
    {
      id: 't1',
      title: t.task1,
      meta: '10:00',
      list: 'today',
      projectId: 'studio',
      desc: t.noteBody,
      priority: 'high',
      status: 'doing',
    },
    { id: 't2', title: t.task2, meta: '14:00', list: 'today', projectId: 'work' },
    { id: 't3', title: t.task3, meta: '', list: 'today', projectId: null },
    {
      id: 't4',
      title: t.task4,
      meta: t.yesterday,
      list: 'today',
      projectId: 'home',
      over: true,
      priority: 'medium',
    },
    { id: 't5', title: t.task5, meta: '', list: 'today', projectId: 'studio' },
    {
      id: 'u1',
      title: ar ? 'موعد طبيب الأسنان' : 'Dentist appointment',
      meta: `${t.tomorrow} · 15:00`,
      list: 'today',
      later: true,
      projectId: 'home',
    },
    {
      id: 'u2',
      title: ar ? 'مراجعة أسبوعية' : 'Weekly review',
      meta: `${t.tomorrow} · 17:00`,
      list: 'today',
      later: true,
      projectId: 'work',
    },
    {
      id: 'u3',
      title: ar ? 'تجديد التأمين' : 'Renew car insurance',
      meta: ar ? 'الأحد' : 'Sun',
      list: 'today',
      later: true,
      projectId: 'home',
    },
    {
      id: 'u4',
      title: ar ? 'إطلاق موقع الاستوديو' : 'Launch Studio website',
      meta: ar ? 'الثلاثاء' : 'Tue',
      list: 'today',
      later: true,
      projectId: 'studio',
    },
    {
      id: 'u5',
      title: ar ? 'حجز فندق عمّان' : 'Book Amman hotel',
      meta: ar ? 'الأربعاء' : 'Wed',
      list: 'today',
      later: true,
      projectId: 'studio',
    },
    {
      id: 'i1',
      title: ar ? 'فكرة: لوحة قراءة شهرية' : 'Idea: monthly reading board',
      meta: '',
      list: 'inbox',
      projectId: null,
    },
    {
      id: 'i2',
      title: ar ? 'سؤال سامي عن الضرائب' : 'Ask Sami about taxes',
      meta: '',
      list: 'inbox',
      projectId: null,
    },
    {
      id: 'i3',
      title: ar ? 'إصلاح مصباح المطبخ' : 'Fix kitchen lamp',
      meta: '',
      list: 'inbox',
      projectId: 'home',
    },
  ];
}

export const load: Record<number, number> = {
  3: 2,
  4: 1,
  8: 3,
  10: 1,
  15: 2,
  17: 4,
  18: 3,
  19: 2,
  21: 1,
  23: 5,
  24: 2,
  29: 1,
};

export function dayPool(t: Strings) {
  return [
    { title: t.task1, meta: '10:00' },
    { title: t.task2, meta: '14:00' },
    { title: t.task5, meta: '' },
    { title: t.task3, meta: '' },
    { title: t.task4, meta: '' },
  ];
}
