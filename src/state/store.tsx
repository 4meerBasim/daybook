import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addDays, dayOfMonth, startOfDay } from '../lib/date';
import type { SnoozeOffset } from '../db/reminders';
import {
  CAPACITY,
  DEFAULT_CAPACITY_MINUTES,
  DISPLAY_NAME,
  ONBOARDED,
  PROJECT_COLORS,
  type DatedTask,
  type ProjectRow,
  type SubtaskRow,
  type TaskRow,
} from '../db/schema';
import {
  archiveProject,
  assignDueDate,
  deleteTask,
  insertProject,
  insertTask,
  restoreTask,
  selectAssigned,
  selectDay,
  selectMonth,
  selectPref,
  selectProjects,
  selectSubtasks,
  selectTask,
  selectToday,
  selectUndated,
  selectUnfiled,
  selectUpcoming,
  setPref,
  setSubtaskCompleted,
  setTaskCompleted,
  setTaskSnoozedUntil,
  snoozeTask,
  updateProjectName,
  updateTask,
  type NewTask,
  type TaskPatch,
} from '../db/queries';

export type Reversal =
  | { kind: 'struck'; seq: number; taskId: string }
  | { kind: 'deleted'; seq: number; taskId: string }
  | { kind: 'snoozed'; seq: number; taskId: string; previous: number | null }
  | { kind: 'rescheduled'; seq: number; taskId: string; previous: number | null };

type Unsequenced<T> = T extends unknown ? Omit<T, 'seq'> : never;

type Snapshot = {
  today: DatedTask[];
  upcoming: DatedTask[];
  assigned: TaskRow[];
  unfiled: TaskRow[];
  projects: ProjectRow[];
  month: DatedTask[];
  displayName: string;
  capacity: number;
  onboarded: boolean;
};

type Store = Snapshot & {
  loaded: boolean;
  revision: number;
  create: (task: NewTask) => void;
  edit: (id: string, patch: TaskPatch) => void;
  complete: (id: string, done: boolean) => void;
  completeSubtask: (id: string, done: boolean) => void;
  snooze: (id: string, offset: SnoozeOffset) => void;
  reschedule: (id: string, dueDate: number | null) => void;
  remove: (id: string) => void;
  restore: (id: string) => void;
  reversal: Reversal | null;
  lift: () => void;
  clearReversal: (seq: number) => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  removeProject: (id: string) => void;
  setDisplayName: (name: string) => void;
  setCapacity: (minutes: number) => void;
  planTomorrow: () => Promise<number>;
  markOnboarded: () => void;
  qa: string;
  setQa: (v: string) => void;
  sel: number;
  setSel: (d: number) => void;
};

const EMPTY: Snapshot = {
  today: [],
  upcoming: [],
  assigned: [],
  unfiled: [],
  projects: [],
  month: [],
  displayName: '',
  capacity: DEFAULT_CAPACITY_MINUTES,
  onboarded: false,
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);
  const [qa, setQa] = useState('');
  const [sel, setSel] = useState(() => dayOfMonth(Date.now()));
  const [reversal, setReversal] = useState<Reversal | null>(null);

  const reload = useCallback(async () => {
    const now = Date.now();
    try {
      const [today, upcoming, assigned, unfiled, projects, month, displayName, capacity, onboarded] =
        await Promise.all([
          selectToday(db, now),
          selectUpcoming(db, now),
          selectAssigned(db),
          selectUnfiled(db),
          selectProjects(db),
          selectMonth(db, now),
          selectPref(db, DISPLAY_NAME),
          selectPref(db, CAPACITY),
          selectPref(db, ONBOARDED),
        ]);
      setSnapshot({
        today,
        upcoming,
        assigned,
        unfiled,
        projects,
        month,
        displayName: displayName ?? '',
        capacity: capacity ? Number(capacity) : DEFAULT_CAPACITY_MINUTES,
        onboarded: onboarded === 'true',
      });
      setRevision((r) => r + 1);
    } finally {
      // Root gates on this, so a failed read must still release it or the app never renders
      setLoaded(true);
    }
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo<Store>(() => {
    const after = (work: Promise<void>) => {
      work.then(reload);
    };

    const find = (id: string): TaskRow | undefined =>
      [snapshot.today, snapshot.upcoming, snapshot.assigned, snapshot.unfiled, snapshot.month]
        .flat()
        .find((k) => k.id === id);

    const offer = (next: Unsequenced<Reversal>) =>
      setReversal((prev) => ({ ...next, seq: (prev?.seq ?? 0) + 1 } as Reversal));

    return {
      ...snapshot,
      loaded,
      revision,
      create: (task) => after(insertTask(db, task, Date.now())),
      edit: (id, patch) => after(updateTask(db, id, patch)),
      complete: (id, done) => {
        if (done) offer({ kind: 'struck', taskId: id });
        after(setTaskCompleted(db, id, done ? Date.now() : null));
      },
      completeSubtask: (id, done) =>
        after(setSubtaskCompleted(db, id, done ? Date.now() : null)),
      snooze: (id, offset) => {
        offer({ kind: 'snoozed', taskId: id, previous: find(id)?.snoozedUntil ?? null });
        after(snoozeTask(db, id, offset, Date.now()));
      },
      reschedule: (id, dueDate) => {
        offer({ kind: 'rescheduled', taskId: id, previous: find(id)?.dueDate ?? null });
        after(updateTask(db, id, { dueDate }));
      },
      remove: (id) => {
        offer({ kind: 'deleted', taskId: id });
        after(deleteTask(db, id, Date.now()));
      },
      restore: (id) => after(restoreTask(db, id)),
      reversal,
      lift: () => {
        if (!reversal) return;
        const { kind, taskId } = reversal;
        setReversal(null);
        if (kind === 'struck') after(setTaskCompleted(db, taskId, null));
        if (kind === 'deleted') after(restoreTask(db, taskId));
        if (kind === 'snoozed') after(setTaskSnoozedUntil(db, taskId, reversal.previous));
        if (kind === 'rescheduled') after(updateTask(db, taskId, { dueDate: reversal.previous }));
      },
      clearReversal: (seq) => setReversal((prev) => (prev && prev.seq === seq ? null : prev)),
      createProject: (name) => {
        const color = PROJECT_COLORS[snapshot.projects.length % PROJECT_COLORS.length];
        after(insertProject(db, name, color, Date.now()));
      },
      renameProject: (id, name) => after(updateProjectName(db, id, name)),
      removeProject: (id) => after(archiveProject(db, id, Date.now())),
      setDisplayName: (name) => after(setPref(db, DISPLAY_NAME, name)),
      setCapacity: (minutes) => after(setPref(db, CAPACITY, String(minutes))),
      planTomorrow: async () => {
        const tomorrow = startOfDay(addDays(Date.now(), 1));
        const [onDay, undated] = await Promise.all([selectDay(db, tomorrow), selectUndated(db)]);
        const booked = onDay
          .filter((k) => k.completedAt === null)
          .reduce((total, k) => total + (k.duration ?? 0), 0);

        let room = snapshot.capacity - booked;
        const filling: string[] = [];
        for (const k of undated) {
          if (room <= 0) break;
          if (k.duration === null || k.duration > room) continue;
          filling.push(k.id);
          room -= k.duration;
        }

        await assignDueDate(db, filling, tomorrow);
        await reload();
        return filling.length;
      },
      markOnboarded: () => after(setPref(db, ONBOARDED, 'true')),
      qa,
      setQa,
      sel,
      setSel,
    };
  }, [db, reload, snapshot, loaded, revision, qa, sel, reversal]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export type TaskDetail = { task: TaskRow | null; subtasks: SubtaskRow[] };

const NO_DETAIL: TaskDetail = { task: null, subtasks: [] };

export function useTaskDetail(taskId: string): TaskDetail {
  const db = useSQLiteContext();
  const { revision } = useStore();
  const [detail, setDetail] = useState<TaskDetail>(NO_DETAIL);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [task, subtasks] = await Promise.all([
        selectTask(db, taskId),
        selectSubtasks(db, taskId),
      ]);
      if (live) setDetail({ task, subtasks });
    };
    load();
    return () => {
      live = false;
    };
  }, [db, taskId, revision]);

  return detail;
}
