import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { dayOfMonth } from '../lib/date';
import type { SnoozeOffset } from '../db/reminders';
import {
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
  deleteTask,
  insertProject,
  insertTask,
  restoreTask,
  selectAssigned,
  selectMonth,
  selectPref,
  selectProjects,
  selectSubtasks,
  selectTask,
  selectToday,
  selectUnfiled,
  selectUpcoming,
  setPref,
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
  assigned: TaskRow[];
  unfiled: TaskRow[];
  projects: ProjectRow[];
  month: DatedTask[];
  displayName: string;
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
  remove: (id: string) => void;
  restore: (id: string) => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  removeProject: (id: string) => void;
  setDisplayName: (name: string) => void;
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

  const reload = useCallback(async () => {
    const now = Date.now();
    try {
      const [today, upcoming, assigned, unfiled, projects, month, displayName, onboarded] =
        await Promise.all([
          selectToday(db, now),
          selectUpcoming(db, now),
          selectAssigned(db),
          selectUnfiled(db),
          selectProjects(db),
          selectMonth(db, now),
          selectPref(db, DISPLAY_NAME),
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

    return {
      ...snapshot,
      loaded,
      revision,
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
      setDisplayName: (name) => after(setPref(db, DISPLAY_NAME, name)),
      markOnboarded: () => after(setPref(db, ONBOARDED, 'true')),
      qa,
      setQa,
      sel,
      setSel,
    };
  }, [db, reload, snapshot, loaded, revision, qa, sel]);

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
