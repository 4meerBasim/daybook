import { Palette } from '../theme/palette';
import { Strings } from '../i18n/strings';

export type ListKey = 'today' | 'inbox';

export type Project = { id: string; name: string; color: keyof Palette };

export type Task = {
  id: string;
  title: string;
  meta: string;
  list: ListKey;
  projectId: string | null;
  over?: boolean;
  later?: boolean;
};

export function projects(t: Strings): Project[] {
  return [
    { id: 'studio', name: t.studio, color: 'blue' },
    { id: 'work', name: t.work, color: 'och' },
    { id: 'home', name: t.home, color: 'moss' },
  ];
}

export function tasks(t: Strings, ar: boolean): Task[] {
  return [
    { id: 't1', title: t.task1, meta: '10:00', list: 'today', projectId: 'studio' },
    { id: 't2', title: t.task2, meta: '14:00', list: 'today', projectId: 'work' },
    { id: 't3', title: t.task3, meta: '', list: 'today', projectId: null },
    { id: 't4', title: t.task4, meta: t.yesterday, list: 'today', projectId: 'home', over: true },
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
