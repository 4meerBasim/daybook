import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { dayOfMonth } from '../lib/date';
import type { SnoozeOffset } from '../db/reminders';
import { PROJECT_COLORS, type DatedTask, type ProjectRow, type SubtaskRow, type TaskRow } from '../db/schema';
import { SEED_INVOICE_TASK_ID } from '../db/seed';
import {
  archiveProject,
  deleteTask,
  insertProject,
  insertTask,
  restoreTask,
  selectAssigned,
  selectInbox,
  selectMonth,
  selectProjects,
  selectSubtasks,
  selectToday,
  selectUpcoming,
  setSubtaskCompleted,
  setTaskCompleted,
  snoozeTask,
  updateProjectName,
  updateTask,
  type NewTask,
  type TaskPatch,
} from '../db/queries';

type Snapshot = {
  today: DatedTask[];
  upcoming: DatedTask[];
  inbox: TaskRow[];
  assigned: TaskRow[];
  projects: ProjectRow[];
  month: DatedTask[];
  subtasks: SubtaskRow[];
};

type Store = Snapshot & {
  loaded: boolean;
  create: (task: NewTask) => void;
  edit: (id: string, patch: TaskPatch) => void;
  complete: (id: string, done: boolean) => void;
  completeSubtask: (id: string, done: boolean) => void;
  snooze: (id: string, offset: SnoozeOffset) => void;
  remove: (id: string) => void;
  restore: (id: string) => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  removeProject: (id: string) => void;
  qa: string;
  setQa: (v: string) => void;
  sel: number;
  setSel: (d: number) => void;
};

const EMPTY: Snapshot = {
  today: [],
  upcoming: [],
  inbox: [],
  assigned: [],
  projects: [],
  month: [],
  subtasks: [],
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [qa, setQa] = useState('');
  const [sel, setSel] = useState(() => dayOfMonth(Date.now()));

  const reload = useCallback(async () => {
    const now = Date.now();
    const [today, upcoming, inbox, assigned, projects, month, subtasks] = await Promise.all([
      selectToday(db, now),
      selectUpcoming(db, now),
      selectInbox(db),
      selectAssigned(db),
      selectProjects(db),
      selectMonth(db, now),
      selectSubtasks(db, SEED_INVOICE_TASK_ID),
    ]);
    setSnapshot({ today, upcoming, inbox, assigned, projects, month, subtasks });
    setLoaded(true);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo<Store>(() => {
    const after = (work: Promise<void>) => {
      work.then(reload);
    };

    return {
      ...snapshot,
      loaded,
      create: (task) => after(insertTask(db, task, Date.now())),
      edit: (id, patch) => after(updateTask(db, id, patch)),
      complete: (id, done) => after(setTaskCompleted(db, id, done ? Date.now() : null)),
      completeSubtask: (id, done) =>
        after(setSubtaskCompleted(db, id, done ? Date.now() : null)),
      snooze: (id, offset) => after(snoozeTask(db, id, offset, Date.now())),
      remove: (id) => after(deleteTask(db, id, Date.now())),
      restore: (id) => after(restoreTask(db, id)),
      createProject: (name) => {
        const color = PROJECT_COLORS[snapshot.projects.length % PROJECT_COLORS.length];
        after(insertProject(db, name, color, Date.now()));
      },
      renameProject: (id, name) => after(updateProjectName(db, id, name)),
      removeProject: (id) => after(archiveProject(db, id, Date.now())),
      qa,
      setQa,
      sel,
      setSel,
    };
  }, [db, reload, snapshot, loaded, qa, sel]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
