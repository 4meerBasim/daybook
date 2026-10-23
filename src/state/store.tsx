import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addDays, dayOfMonth, startOfDay } from '../lib/date';
import type { SnoozeOffset } from '../db/reminders';
import {
  CAPACITY,
  DEFAULT_CAPACITY_MINUTES,
  DISPLAY_NAME,
  INK_DECAY,
  ONBOARDED,
  PROJECT_COLORS,
  type ClosedDayRow,
  type ClosedEntryRow,
  type DatedTask,
  type NoteLineRow,
  type NoteRow,
  type ProjectRow,
  type SubtaskRow,
  type TaskRow,
} from '../db/schema';
import {
  archiveProject,
  assignDueDate,
  closeDay,
  deleteNote,
  deleteNoteLine,
  deleteTask,
  demoteNoteLine,
  insertNote,
  insertNoteLine,
  insertProject,
  insertTask,
  promoteNoteLine,
  renameNote,
  restoreTask,
  selectAssigned,
  selectClosedDay,
  selectClosedDays,
  selectClosedEntries,
  selectDay,
  selectMonth,
  selectNote,
  selectNoteLineForTask,
  selectNoteLines,
  selectNotes,
  selectPref,
  selectProjects,
  selectSubtasks,
  selectTask,
  selectDealable,
  selectSomeday,
  selectToday,
  selectUndated,
  selectUnfiled,
  selectUpcoming,
  selectWaiting,
  setPref,
  setSubtaskCompleted,
  setTaskCompleted,
  setTaskBlocked,
  setTaskSnoozedUntil,
  setTaskSomeday,
  snoozeTask,
  updateNoteLine,
  updateProjectName,
  updateTask,
  type Decision,
  type NewTask,
  type TaskPatch,
} from '../db/queries';

export type Reversal =
  | { kind: 'struck'; seq: number; taskId: string }
  | { kind: 'deleted'; seq: number; taskId: string }
  | { kind: 'snoozed'; seq: number; taskId: string; previous: number | null }
  | { kind: 'rescheduled'; seq: number; taskId: string; previous: number | null }
  | { kind: 'shelved'; seq: number; taskId: string; previous: number | null };

type Unsequenced<T> = T extends unknown ? Omit<T, 'seq'> : never;

type Snapshot = {
  today: DatedTask[];
  upcoming: DatedTask[];
  assigned: TaskRow[];
  unfiled: TaskRow[];
  dealable: TaskRow[];
  someday: TaskRow[];
  waiting: TaskRow[];
  projects: ProjectRow[];
  notes: NoteRow[];
  month: DatedTask[];
  closedToday: ClosedDayRow | null;
  closedDays: ClosedDayRow[];
  displayName: string;
  capacity: number;
  decayOn: boolean;
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
  shelve: (id: string) => void;
  block: (id: string, blockedBy: string, nudgeAt: number) => void;
  unblock: (id: string) => void;
  unshelve: (id: string, dueDate: number | null) => void;
  remove: (id: string) => void;
  restore: (id: string) => void;
  reversal: Reversal | null;
  lift: () => void;
  clearReversal: (seq: number) => void;
  createNote: (title: string) => Promise<string>;
  renameNote: (id: string, title: string) => void;
  removeNote: (id: string) => void;
  addLine: (noteId: string, text: string, after: number) => Promise<string>;
  editLine: (id: string, text: string) => void;
  removeLine: (id: string) => void;
  promoteLine: (id: string, text: string) => void;
  demoteLine: (id: string) => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  removeProject: (id: string) => void;
  setDisplayName: (name: string) => void;
  setCapacity: (minutes: number) => void;
  setDecayOn: (on: boolean) => void;
  retire: (id: string, outcome: 'doIt' | 'schedule' | 'shelve') => void;
  planTomorrow: () => Promise<number>;
  closePage: (decisions: Decision[]) => Promise<void>;
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
  dealable: [],
  someday: [],
  waiting: [],
  projects: [],
  notes: [],
  month: [],
  closedToday: null,
  closedDays: [],
  displayName: '',
  capacity: DEFAULT_CAPACITY_MINUTES,
  decayOn: true,
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
      const [
        today,
        upcoming,
        assigned,
        unfiled,
        dealable,
        someday,
        waiting,
        projects,
        notes,
        month,
        closedToday,
        closedDays,
        displayName,
        capacity,
        decayOn,
        onboarded,
      ] = await Promise.all([
        selectToday(db, now),
        selectUpcoming(db, now),
        selectAssigned(db),
        selectUnfiled(db),
        selectDealable(db, now),
        selectSomeday(db),
        selectWaiting(db),
        selectProjects(db),
        selectNotes(db),
        selectMonth(db, now),
        selectClosedDay(db, now),
        selectClosedDays(db),
        selectPref(db, DISPLAY_NAME),
        selectPref(db, CAPACITY),
        selectPref(db, INK_DECAY),
        selectPref(db, ONBOARDED),
      ]);
      setSnapshot({
        today,
        upcoming,
        assigned,
        unfiled,
        dealable,
        someday,
        waiting,
        projects,
        notes,
        month,
        closedToday,
        closedDays,
        displayName: displayName ?? '',
        capacity: capacity ? Number(capacity) : DEFAULT_CAPACITY_MINUTES,
        decayOn: decayOn !== 'false',
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
      [
        snapshot.today,
        snapshot.upcoming,
        snapshot.assigned,
        snapshot.unfiled,
        snapshot.someday,
        snapshot.waiting,
        snapshot.month,
      ]
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
      shelve: (id) => {
        offer({ kind: 'shelved', taskId: id, previous: find(id)?.dueDate ?? null });
        after(setTaskSomeday(db, id, Date.now(), null));
      },
      unshelve: (id, dueDate) => after(setTaskSomeday(db, id, null, dueDate)),
      block: (id, blockedBy, nudgeAt) =>
        after(setTaskBlocked(db, id, blockedBy, nudgeAt, Date.now())),
      unblock: (id) => after(setTaskBlocked(db, id, null, null, Date.now())),
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
        if (kind === 'shelved') after(setTaskSomeday(db, taskId, null, reversal.previous));
      },
      clearReversal: (seq) => setReversal((prev) => (prev && prev.seq === seq ? null : prev)),
      createNote: async (title) => {
        const id = await insertNote(db, title, Date.now());
        await reload();
        return id;
      },
      renameNote: (id, title) => after(renameNote(db, id, title, Date.now())),
      removeNote: (id) => after(deleteNote(db, id, Date.now())),
      addLine: async (noteId, text, position) => {
        const id = await insertNoteLine(db, noteId, text, position, Date.now());
        await reload();
        return id;
      },
      editLine: (id, text) => after(updateNoteLine(db, id, text, Date.now())),
      removeLine: (id) => after(deleteNoteLine(db, id, Date.now())),
      promoteLine: (id, text) =>
        after(promoteNoteLine(db, id, text, startOfDay(Date.now()), Date.now())),
      demoteLine: (id) => after(demoteNoteLine(db, id)),
      createProject: (name) => {
        const color = PROJECT_COLORS[snapshot.projects.length % PROJECT_COLORS.length];
        after(insertProject(db, name, color, Date.now()));
      },
      renameProject: (id, name) => after(updateProjectName(db, id, name)),
      removeProject: (id) => after(archiveProject(db, id, Date.now())),
      setDisplayName: (name) => after(setPref(db, DISPLAY_NAME, name)),
      setCapacity: (minutes) => after(setPref(db, CAPACITY, String(minutes))),
      setDecayOn: (on) => after(setPref(db, INK_DECAY, on ? 'true' : 'false')),
      retire: (id, outcome) => {
        const task = find(id);
        if (!task) return;
        const answered = { retireAskedCarry: task.carryCount };
        if (outcome === 'doIt') {
          offer({ kind: 'rescheduled', taskId: id, previous: task.dueDate });
          after(updateTask(db, id, { ...answered, dueDate: startOfDay(Date.now()) }));
          return;
        }
        if (outcome === 'schedule') {
          offer({ kind: 'rescheduled', taskId: id, previous: task.dueDate });
          after(updateTask(db, id, { ...answered, dueDate: startOfDay(addDays(Date.now(), 7)) }));
          return;
        }
        offer({ kind: 'shelved', taskId: id, previous: task.dueDate });
        after(
          updateTask(db, id, { ...answered, somedayAt: Date.now(), dueDate: null })
        );
      },
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
      closePage: async (decisions) => {
        const settled = snapshot.today.filter((k) => k.completedAt !== null);
        await closeDay(db, Date.now(), settled, decisions, Date.now());
        await reload();
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

export type TaskDetail = {
  task: TaskRow | null;
  subtasks: SubtaskRow[];
  source: NoteRow | null;
};

const NO_DETAIL: TaskDetail = { task: null, subtasks: [], source: null };

export type NoteDetail = { note: NoteRow | null; lines: NoteLineRow[]; tasks: TaskRow[] };

const NO_NOTE: NoteDetail = { note: null, lines: [], tasks: [] };

export function useNote(noteId: string): NoteDetail {
  const db = useSQLiteContext();
  const { revision } = useStore();
  const [detail, setDetail] = useState<NoteDetail>(NO_NOTE);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [note, lines] = await Promise.all([
        selectNote(db, noteId),
        selectNoteLines(db, noteId),
      ]);
      const ids = lines.map((l) => l.taskId).filter((id): id is string => id !== null);
      const tasks = await Promise.all(ids.map((id) => selectTask(db, id)));
      if (live) {
        setDetail({
          note,
          lines,
          tasks: tasks.filter((task): task is TaskRow => task !== null),
        });
      }
    };
    load();
    return () => {
      live = false;
    };
  }, [db, noteId, revision]);

  return detail;
}

export type ClosedPage = { day: ClosedDayRow | null; entries: ClosedEntryRow[] };

const NO_PAGE: ClosedPage = { day: null, entries: [] };

export function useClosedPage(day: number): ClosedPage {
  const db = useSQLiteContext();
  const { revision } = useStore();
  const [page, setPage] = useState<ClosedPage>(NO_PAGE);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [closed, entries] = await Promise.all([
        selectClosedDay(db, day),
        selectClosedEntries(db, day),
      ]);
      if (live) setPage({ day: closed, entries });
    };
    load();
    return () => {
      live = false;
    };
  }, [db, day, revision]);

  return page;
}

export function useTaskDetail(taskId: string): TaskDetail {
  const db = useSQLiteContext();
  const { revision } = useStore();
  const [detail, setDetail] = useState<TaskDetail>(NO_DETAIL);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [task, subtasks, line] = await Promise.all([
        selectTask(db, taskId),
        selectSubtasks(db, taskId),
        selectNoteLineForTask(db, taskId),
      ]);
      const source = line ? await selectNote(db, line.noteId) : null;
      if (live) setDetail({ task, subtasks, source });
    };
    load();
    return () => {
      live = false;
    };
  }, [db, taskId, revision]);

  return detail;
}
