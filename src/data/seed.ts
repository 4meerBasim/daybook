import { Palette } from '../theme/palette';
import { Strings } from '../i18n/strings';

export type Task = {
  id: string;
  title: string;
  time: string;
  color: keyof Palette;
  over?: boolean;
};

export function tasks(t: Strings): Task[] {
  return [
    { id: 't1', title: t.task1, time: '10:00', color: 'blue' },
    { id: 't2', title: t.task2, time: '14:00', color: 'och' },
    { id: 't3', title: t.task3, time: '', color: 'moss' },
    { id: 't4', title: t.task4, time: t.yesterday, color: 'ver', over: true },
    { id: 't5', title: t.task5, time: '', color: 'blue' },
  ];
}

export type UpcomingGroup = {
  day: string;
  date: string;
  count: string;
  items: { title: string; meta: string; color: keyof Palette }[];
};

export function upcoming(t: Strings, ar: boolean): UpcomingGroup[] {
  return [
    {
      day: t.tomorrow,
      date: ar ? 'الجمعة ١٩' : 'Fri 19',
      count: '2',
      items: [
        { title: ar ? 'موعد طبيب الأسنان' : 'Dentist appointment', meta: '15:00', color: 'moss' },
        { title: ar ? 'مراجعة أسبوعية' : 'Weekly review', meta: '↻ 17:00', color: 'och' },
      ],
    },
    {
      day: ar ? 'الأحد' : 'Sunday',
      date: ar ? '٢١ سبتمبر' : 'Sep 21',
      count: '1',
      items: [{ title: ar ? 'تجديد التأمين' : 'Renew car insurance', meta: '', color: 'ver' }],
    },
    {
      day: ar ? 'الأسبوع القادم' : 'Next week',
      date: ar ? '٢٢–٢٨' : '22–28',
      count: '3',
      items: [
        { title: ar ? 'إطلاق موقع الاستوديو' : 'Launch Studio website', meta: ar ? 'الثلاثاء' : 'Tue', color: 'blue' },
        { title: ar ? 'حجز فندق عمّان' : 'Book Amman hotel', meta: ar ? 'الأربعاء' : 'Wed', color: 'blue' },
      ],
    },
  ];
}

export function inbox(ar: boolean): { title: string }[] {
  return [
    { title: ar ? 'فكرة: لوحة قراءة شهرية' : 'Idea: monthly reading board' },
    { title: ar ? 'سؤال سامي عن الضرائب' : 'Ask Sami about taxes' },
    { title: ar ? 'إصلاح مصباح المطبخ' : 'Fix kitchen lamp' },
  ];
}

export type ProjectItem = { title: string; meta: string; done: boolean };

export function project(t: Strings, ar: boolean): ProjectItem[] {
  return [
    { title: ar ? 'ملخص المشروع' : 'Project brief', meta: ar ? 'الإثنين' : 'Mon', done: true },
    { title: ar ? 'لوحات المزاج' : 'Moodboards', meta: ar ? 'الثلاثاء' : 'Tue', done: true },
    { title: t.task1, meta: '10:00', done: false },
    { title: ar ? 'إطلاق موقع الاستوديو' : 'Launch Studio website', meta: ar ? 'الثلاثاء' : 'Tue', done: false },
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
