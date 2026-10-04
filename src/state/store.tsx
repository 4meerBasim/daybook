import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import {
  Attachment,
  builtinTemplates,
  ColorKey,
  DEFAULT_JOURNAL_ID,
  defaultJournal,
  Entry,
  EntryTemplate,
  Journal,
  Project,
  projects,
  SmartList,
  SmartListRule,
  Subtask,
  Task,
  tasks,
} from '../data/seed';
import { computeStreak, dayKey, monthDayKey, startOfToday } from '../lib/day';
import { nextOccurrence, RecurrenceRule } from '../lib/recurrence';
import { deleteAttachmentFile } from '../lib/attachments';
import { newId } from '../lib/id';
import { refreshTodayWidget } from '../widget/refresh';
import {
  addHabitSessionRow,
  deleteAttachmentRow,
  deleteEntryRow,
  deleteEntryTemplateRow,
  deleteJournalRow,
  deleteSmartListRow,
  deleteSubtaskRow,
  deleteTaskRow,
  DEFAULT_PREFS,
  JournalPrefs,
  reassignEntriesJournal,
  setSetting,
  upsertFocusSession,
  setSubtaskState,
  setTaskState,
  setTaskTags,
  StoreSnapshot,
  upsertAttachment,
  upsertEntry,
  upsertEntryTemplate,
  upsertHabit,
  upsertJournal,
  upsertProject,
  upsertSmartList,
  upsertSubtask,
  upsertTask,
} from '../lib/db';

export type Habit = { id: string; name: string; streak: number; minutes: number };

export type HabitSession = { habitId: string; startedAt: number; seconds: number };

export type FocusSession = { id: string; taskId: string | null; startedAt: number; seconds: number };

type Store = {
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  cleared: Record<string, boolean>;
  clear: (id: string) => void;
  added: Task[];
  addTask: (task: Omit<Task, 'id'>) => Task;
  ensureTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setDue: (id: string, dueAt: number | null, someday?: boolean) => void;
  setTaskReminder: (id: string, reminderAt: number | null) => void;
  setRecurrence: (id: string, rule: RecurrenceRule | null) => void;
  setColor: (id: string, color: ColorKey | null) => void;
  setEisenhower: (id: string, important: boolean, urgent: boolean) => void;
  subtasks: Subtask[];
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (id: string) => void;
  renameSubtask: (id: string, title: string) => void;
  removeSubtask: (id: string) => void;
  reorderSubtasks: (taskId: string, orderedIds: string[]) => void;
  smartLists: SmartList[];
  addSmartList: (name: string, rules: SmartListRule) => void;
  updateSmartList: (id: string, patch: Partial<Omit<SmartList, 'id'>>) => void;
  removeSmartList: (id: string) => void;
  attachments: Attachment[];
  addAttachment: (a: Omit<Attachment, 'id' | 'createdAt'>) => Attachment;
  removeAttachment: (id: string) => void;
  addedProjects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  addedHabits: Habit[];
  addHabit: (name: string, minutes: number) => void;
  habitSessions: HabitSession[];
  addHabitSession: (session: HabitSession) => void;
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  addedJournals: Journal[];
  addJournal: (journal: Omit<Journal, 'id'>) => Journal;
  updateJournal: (id: string, patch: Partial<Omit<Journal, 'id'>>) => void;
  removeJournal: (id: string) => void;
  currentJournalId: string;
  setCurrentJournal: (id: string) => void;
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => Entry;
  updateEntry: (id: string, patch: Partial<Omit<Entry, 'id'>>) => void;
  removeEntry: (id: string) => void;
  addedTemplates: EntryTemplate[];
  addTemplate: (template: Omit<EntryTemplate, 'id' | 'builtIn'>) => EntryTemplate;
  removeTemplate: (id: string) => void;
  contextEnabled: boolean;
  setContextEnabled: (v: boolean) => void;
  reminderEnabled: boolean;
  reminderTime: string;
  setReminder: (enabled: boolean, time: string) => void;
  onThisDayEnabled: boolean;
  setOnThisDay: (v: boolean) => void;
  deviceCalendarEnabled: boolean;
  setDeviceCalendarEnabled: (v: boolean) => void;
  deviceCalendarIds: string[];
  setDeviceCalendarIds: (ids: string[]) => void;
  appLockEnabled: boolean;
  setAppLockEnabled: (v: boolean) => void;
  syncEnabled: boolean;
  setSyncEnabled: (v: boolean) => void;
  syncOwnerId: string;
  ensureOwnerId: () => string;
  userId: string | null;
  userEmail: string | null;
  setSession: (session: { userId: string; email: string | null } | null) => void;
  lastSyncAt: number;
  setLastSyncAt: (ts: number) => void;
  hydrate: (snap: StoreSnapshot) => void;
  qa: string;
  setQa: (v: string) => void;
  sel: number;
  setSel: (d: number) => void;
};

const StoreContext = createContext<Store | null>(null);

const emptySnapshot: StoreSnapshot = {
  done: {},
  cleared: {},
  added: [],
  addedProjects: [],
  addedHabits: [],
  habitSessions: [],
  focusSessions: [],
  journals: [],
  entries: [],
  templates: [],
  subtasks: [],
  smartLists: [],
  attachments: [],
  prefs: DEFAULT_PREFS,
};

export function StoreProvider({
  children,
  initial = emptySnapshot,
}: {
  children: React.ReactNode;
  initial?: StoreSnapshot;
}) {
  const [done, setDone] = useState<Record<string, boolean>>(initial.done);
  const [cleared, setCleared] = useState<Record<string, boolean>>(initial.cleared);
  const [added, setAdded] = useState<Task[]>(initial.added);
  const [addedProjects, setAddedProjects] = useState<Project[]>(initial.addedProjects);
  const [addedHabits, setAddedHabits] = useState<Habit[]>(initial.addedHabits);
  const [habitSessions, setHabitSessions] = useState<HabitSession[]>(initial.habitSessions);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(initial.focusSessions);
  const [addedJournals, setAddedJournals] = useState<Journal[]>(initial.journals);
  const [entries, setEntries] = useState<Entry[]>(initial.entries);
  const [addedTemplates, setAddedTemplates] = useState<EntryTemplate[]>(initial.templates);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial.subtasks);
  const [smartLists, setSmartLists] = useState<SmartList[]>(initial.smartLists);
  const [attachments, setAttachments] = useState<Attachment[]>(initial.attachments);
  const [prefs, setPrefs] = useState<JournalPrefs>(initial.prefs);
  const [qa, setQa] = useState('Call dentist tomorrow 3pm #health');
  const [sel, setSel] = useState(18);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const addedRef = useRef<Task[]>(initial.added);

  const value = useMemo<Store>(() => {
    const writeAdded = (next: Task[]) => {
      addedRef.current = next;
      setAdded(next);
    };
    const removeAttachmentsWhere = (pred: (a: Attachment) => boolean) => {
      const toRemove = attachments.filter(pred);
      if (!toRemove.length) return;
      const ids = new Set(toRemove.map((a) => a.id));
      for (const a of toRemove) {
        deleteAttachmentRow(a.id);
        deleteAttachmentFile(a.uri);
      }
      setAttachments((list) => list.filter((a) => !ids.has(a.id)));
    };
    return {
      done,
      toggle: (id) => {
        const next = !done[id];
        const list = addedRef.current;
        const task = list.find((t) => t.id === id);
        if (next && task?.recurrence) {
          const rule = task.recurrence;
          const base = rule.afterCompletion ? Date.now() : task.dueAt ?? Date.now();
          const nextDue = nextOccurrence(rule, base);
          const oldDue = task.dueAt ?? null;
          const reminderAt =
            task.reminderAt != null && oldDue != null
              ? task.reminderAt + (nextDue - oldDue)
              : task.reminderAt ?? null;
          const advanced: Task = { ...task, dueAt: nextDue, reminderAt };
          writeAdded(list.map((t) => (t.id === id ? advanced : t)));
          upsertTask(advanced);
          void refreshTodayWidget();
          return;
        }
        setDone((d) => ({ ...d, [id]: next }));
        setTaskState(id, next, cleared[id] ?? false);
        void refreshTodayWidget();
      },
      cleared,
      clear: (id) => {
        setCleared((k) => ({ ...k, [id]: true }));
        setTaskState(id, done[id] ?? false, true);
        void refreshTodayWidget();
      },
      added,
      addTask: (task) => {
        const created: Task = { ...task, id: newId() };
        writeAdded([...addedRef.current, created]);
        upsertTask(created);
        setTaskTags(created.id, created.tags ?? []);
        void refreshTodayWidget();
        return created;
      },
      ensureTask: (task) => {
        if (addedRef.current.some((t) => t.id === task.id)) return;
        const copy: Task = { ...task };
        writeAdded([...addedRef.current, copy]);
        upsertTask(copy);
      },
      updateTask: (id, patch) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const merged: Task = { ...target, ...patch };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
      },
      deleteTask: (id) => {
        writeAdded(addedRef.current.filter((t) => t.id !== id));
        removeAttachmentsWhere((a) => a.taskId === id);
        deleteTaskRow(id);
        void refreshTodayWidget();
      },
      setDue: (id, dueAt, someday) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const sd = someday ?? false;
        const merged: Task = { ...target, dueAt, someday: sd, later: sd };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
        void refreshTodayWidget();
      },
      setTaskReminder: (id, reminderAt) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const merged: Task = { ...target, reminderAt };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
      },
      setRecurrence: (id, rule) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const merged: Task = { ...target, recurrence: rule };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
      },
      setColor: (id, color) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const merged: Task = { ...target, color };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
      },
      setEisenhower: (id, important, urgent) => {
        const list = addedRef.current;
        const target = list.find((t) => t.id === id);
        if (!target) return;
        const merged: Task = { ...target, important, urgent };
        writeAdded(list.map((t) => (t.id === id ? merged : t)));
        upsertTask(merged);
      },
      subtasks,
      addSubtask: (taskId, title) => {
        const position = subtasks.filter((s) => s.taskId === taskId).length;
        const created: Subtask = { id: newId(), taskId, title, done: false, position };
        setSubtasks((list) => [...list, created]);
        upsertSubtask(created);
      },
      toggleSubtask: (id) => {
        const target = subtasks.find((s) => s.id === id);
        if (!target) return;
        const nextDone = !target.done;
        setSubtasks((list) => list.map((s) => (s.id === id ? { ...s, done: nextDone } : s)));
        setSubtaskState(id, nextDone);
      },
      renameSubtask: (id, title) => {
        const target = subtasks.find((s) => s.id === id);
        if (!target) return;
        const merged: Subtask = { ...target, title };
        setSubtasks((list) => list.map((s) => (s.id === id ? merged : s)));
        upsertSubtask(merged);
      },
      removeSubtask: (id) => {
        setSubtasks((list) => list.filter((s) => s.id !== id));
        deleteSubtaskRow(id);
      },
      reorderSubtasks: (taskId, orderedIds) => {
        const positions = new Map(orderedIds.map((sid, i) => [sid, i]));
        const reordered = subtasks
          .filter((s) => s.taskId === taskId && positions.has(s.id))
          .map((s) => ({ ...s, position: positions.get(s.id) as number }));
        setSubtasks((list) =>
          list.map((s) => {
            const pos = s.taskId === taskId ? positions.get(s.id) : undefined;
            return pos != null ? { ...s, position: pos } : s;
          })
        );
        for (const s of reordered) upsertSubtask(s);
      },
      smartLists,
      addSmartList: (name, rules) => {
        const created: SmartList = { id: newId(), name, rules, position: smartLists.length };
        setSmartLists((list) => [...list, created]);
        upsertSmartList(created);
      },
      updateSmartList: (id, patch) => {
        const target = smartLists.find((l) => l.id === id);
        if (!target) return;
        const merged: SmartList = { ...target, ...patch };
        setSmartLists((list) => list.map((l) => (l.id === id ? merged : l)));
        upsertSmartList(merged);
      },
      removeSmartList: (id) => {
        setSmartLists((list) => list.filter((l) => l.id !== id));
        deleteSmartListRow(id);
      },
      attachments,
      addAttachment: (a) => {
        const created: Attachment = { ...a, id: newId(), createdAt: Date.now() };
        setAttachments((list) => [...list, created]);
        upsertAttachment(created);
        return created;
      },
      removeAttachment: (id) => {
        const target = attachments.find((a) => a.id === id);
        setAttachments((list) => list.filter((a) => a.id !== id));
        deleteAttachmentRow(id);
        if (target) deleteAttachmentFile(target.uri);
      },
      addedProjects,
      addProject: (project) => {
        const created: Project = { ...project, id: newId() };
        setAddedProjects((p) => [...p, created]);
        upsertProject(created);
      },
      addedHabits,
      addHabit: (name, minutes) => {
        const created: Habit = { id: newId(), name, streak: 0, minutes };
        setAddedHabits((h) => [...h, created]);
        upsertHabit(created);
      },
      habitSessions,
      addHabitSession: (session) => {
        setHabitSessions((s) => [...s, session]);
        addHabitSessionRow(session);
      },
      focusSessions,
      addFocusSession: (session) => {
        const created: FocusSession = { ...session, id: newId() };
        setFocusSessions((list) => [...list, created]);
        upsertFocusSession(created);
      },
      addedJournals,
      addJournal: (journal) => {
        const created: Journal = { ...journal, id: newId() };
        setAddedJournals((j) => [...j, created]);
        upsertJournal(created);
        return created;
      },
      updateJournal: (id, patch) => {
        const target = addedJournals.find((j) => j.id === id);
        if (!target) return;
        const merged = { ...target, ...patch };
        setAddedJournals((list) => list.map((j) => (j.id === id ? merged : j)));
        upsertJournal(merged);
      },
      removeJournal: (id) => {
        if (id === DEFAULT_JOURNAL_ID) return;
        setAddedJournals((list) => list.filter((j) => j.id !== id));
        setEntries((list) =>
          list.map((e) => (e.journalId === id ? { ...e, journalId: DEFAULT_JOURNAL_ID } : e))
        );
        reassignEntriesJournal(id, DEFAULT_JOURNAL_ID);
        deleteJournalRow(id);
        if (prefs.currentJournalId === id) {
          setPrefs((p) => ({ ...p, currentJournalId: DEFAULT_JOURNAL_ID }));
          setSetting('currentJournalId', DEFAULT_JOURNAL_ID);
        }
      },
      currentJournalId: prefs.currentJournalId,
      setCurrentJournal: (id) => {
        setPrefs((p) => ({ ...p, currentJournalId: id }));
        setSetting('currentJournalId', id);
      },
      entries,
      addEntry: (entry) => {
        const created: Entry = { ...entry, id: newId(), createdAt: Date.now() };
        setEntries((list) => [...list, created]);
        upsertEntry(created);
        return created;
      },
      updateEntry: (id, patch) => {
        const target = entries.find((e) => e.id === id);
        if (!target) return;
        const merged = { ...target, ...patch };
        setEntries((list) => list.map((e) => (e.id === id ? merged : e)));
        upsertEntry(merged);
      },
      removeEntry: (id) => {
        setEntries((list) => list.filter((e) => e.id !== id));
        removeAttachmentsWhere((a) => a.entryId === id);
        deleteEntryRow(id);
      },
      addedTemplates,
      addTemplate: (template) => {
        const created: EntryTemplate = { ...template, id: newId(), builtIn: false };
        setAddedTemplates((list) => [...list, created]);
        upsertEntryTemplate(created);
        return created;
      },
      removeTemplate: (id) => {
        setAddedTemplates((list) => list.filter((tpl) => tpl.id !== id));
        deleteEntryTemplateRow(id);
      },
      contextEnabled: prefs.contextEnabled,
      setContextEnabled: (v) => {
        setPrefs((p) => ({ ...p, contextEnabled: v }));
        setSetting('contextEnabled', v ? '1' : '0');
      },
      reminderEnabled: prefs.reminderEnabled,
      reminderTime: prefs.reminderTime,
      setReminder: (enabled, time) => {
        setPrefs((p) => ({ ...p, reminderEnabled: enabled, reminderTime: time }));
        setSetting('reminderEnabled', enabled ? '1' : '0');
        setSetting('reminderTime', time);
      },
      onThisDayEnabled: prefs.onThisDayEnabled,
      setOnThisDay: (v) => {
        setPrefs((p) => ({ ...p, onThisDayEnabled: v }));
        setSetting('onThisDayEnabled', v ? '1' : '0');
      },
      deviceCalendarEnabled: prefs.deviceCalendarEnabled,
      setDeviceCalendarEnabled: (v) => {
        setPrefs((p) => ({ ...p, deviceCalendarEnabled: v }));
        setSetting('deviceCalendarEnabled', v ? '1' : '0');
      },
      deviceCalendarIds: prefs.deviceCalendarIds,
      setDeviceCalendarIds: (ids) => {
        setPrefs((p) => ({ ...p, deviceCalendarIds: ids }));
        setSetting('deviceCalendarIds', JSON.stringify(ids));
      },
      appLockEnabled: prefs.appLockEnabled,
      setAppLockEnabled: (v) => {
        setPrefs((p) => ({ ...p, appLockEnabled: v }));
        setSetting('appLockEnabled', v ? '1' : '0');
      },
      syncEnabled: prefs.syncEnabled,
      setSyncEnabled: (v) => {
        setPrefs((p) => ({ ...p, syncEnabled: v }));
        setSetting('syncEnabled', v ? '1' : '0');
      },
      syncOwnerId: prefs.syncOwnerId,
      ensureOwnerId: () => userId ?? '',
      userId,
      userEmail,
      setSession: (session) => {
        if (session) {
          setUserId(session.userId);
          setUserEmail(session.email);
          // First sign-in (or a different account): re-push all local data under the
          // authenticated owner so previously anonymous-owned rows migrate forward.
          if (prefs.syncOwnerId && prefs.syncOwnerId !== session.userId) {
            setPrefs((p) => ({ ...p, lastSyncAt: 0 }));
            setSetting('lastSyncAt', '0');
          }
          if (prefs.syncOwnerId !== session.userId) {
            setPrefs((p) => ({ ...p, syncOwnerId: session.userId }));
            setSetting('syncOwnerId', session.userId);
          }
        } else {
          setUserId(null);
          setUserEmail(null);
          if (prefs.syncOwnerId) {
            setPrefs((p) => ({ ...p, syncOwnerId: '' }));
            setSetting('syncOwnerId', '');
          }
        }
      },
      lastSyncAt: prefs.lastSyncAt,
      setLastSyncAt: (ts) => {
        setPrefs((p) => ({ ...p, lastSyncAt: ts }));
        setSetting('lastSyncAt', String(ts));
      },
      hydrate: (snap) => {
        setDone(snap.done);
        setCleared(snap.cleared);
        writeAdded(snap.added);
        setAddedProjects(snap.addedProjects);
        setAddedHabits(snap.addedHabits);
        setHabitSessions(snap.habitSessions);
        setFocusSessions(snap.focusSessions);
        setAddedJournals(snap.journals);
        setEntries(snap.entries);
        setAddedTemplates(snap.templates);
        setSubtasks(snap.subtasks);
        setSmartLists(snap.smartLists);
        setAttachments(snap.attachments);
        setPrefs(snap.prefs);
        void refreshTodayWidget();
      },
      qa,
      setQa,
      sel,
      setSel,
    };
  }, [done, cleared, added, subtasks, smartLists, attachments, addedProjects, addedHabits, habitSessions, focusSessions, addedJournals, entries, addedTemplates, prefs, qa, sel, userId, userEmail]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useTasks() {
  const { t, ar } = useTheme();
  const { added, cleared } = useStore();
  const addedIds = new Set(added.map((k) => k.id));
  return [...tasks(t, ar).filter((k) => !addedIds.has(k.id)), ...added].filter(
    (k) => !cleared[k.id]
  );
}

export function useProjects() {
  const { t } = useTheme();
  const { addedProjects } = useStore();
  return [...projects(t), ...addedProjects];
}

export function useHabits(): Habit[] {
  const { t } = useTheme();
  const { addedHabits } = useStore();
  return [{ id: 'h1', name: t.habit1, streak: 12, minutes: 30 }, ...addedHabits];
}

export function useJournals(): Journal[] {
  const { t } = useTheme();
  const { addedJournals } = useStore();
  return [defaultJournal(t), ...addedJournals];
}

export function useCurrentJournal(): Journal {
  const journals = useJournals();
  const { currentJournalId } = useStore();
  return journals.find((j) => j.id === currentJournalId) ?? journals[0];
}

export function useTemplates(): EntryTemplate[] {
  const { t } = useTheme();
  const { addedTemplates } = useStore();
  return [...builtinTemplates(t), ...addedTemplates];
}

export function useStreak(): number {
  const { entries } = useStore();
  return computeStreak(entries.map((e) => e.day));
}

export function useSubtasks(taskId: string): Subtask[] {
  const { subtasks } = useStore();
  return subtasks.filter((s) => s.taskId === taskId).sort((a, b) => a.position - b.position);
}

export function useSubtaskProgress(taskId: string): { done: number; total: number } {
  const subs = useSubtasks(taskId);
  return { done: subs.filter((s) => s.done).length, total: subs.length };
}

export function useSmartLists(): SmartList[] {
  const { smartLists } = useStore();
  return smartLists;
}

export function useTaskAttachments(taskId: string): Attachment[] {
  const { attachments } = useStore();
  return attachments
    .filter((a) => a.taskId === taskId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function useEntryAttachments(entryId: string): Attachment[] {
  const { attachments } = useStore();
  return attachments
    .filter((a) => a.entryId === entryId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export type FocusStats = {
  totalSeconds: number;
  count: number;
  todaySeconds: number;
  todayCount: number;
  weekSeconds: number;
  weekCount: number;
};

export function useFocusStats(): FocusStats {
  const { focusSessions } = useStore();
  const startToday = startOfToday();
  const now = new Date();
  const startWeek = startToday - ((now.getDay() + 6) % 7) * 86400000;
  let totalSeconds = 0;
  let todaySeconds = 0;
  let todayCount = 0;
  let weekSeconds = 0;
  let weekCount = 0;
  for (const s of focusSessions) {
    totalSeconds += s.seconds;
    if (s.startedAt >= startToday) {
      todaySeconds += s.seconds;
      todayCount += 1;
    }
    if (s.startedAt >= startWeek) {
      weekSeconds += s.seconds;
      weekCount += 1;
    }
  }
  return { totalSeconds, count: focusSessions.length, todaySeconds, todayCount, weekSeconds, weekCount };
}

export const KARMA_THRESHOLDS = [0, 100, 300, 700, 1500, 3000];

export type Karma = { points: number; level: number; nextAt: number | null; todayGain: number };

export function useKarma(): Karma {
  const { done, habitSessions, focusSessions } = useStore();
  const streak = useStreak();
  const allTasks = useTasks();
  const minutes = (seconds: number) => Math.round(seconds / 60);

  const doneCount = allTasks.reduce((n, k) => (done[k.id] ? n + 1 : n), 0);
  const habitMinutes = habitSessions.reduce((n, s) => n + minutes(s.seconds), 0);
  const focusMinutes = focusSessions.reduce((n, s) => n + minutes(s.seconds), 0);
  const points = doneCount * 10 + habitMinutes + focusMinutes + streak * 5;

  const startToday = startOfToday();
  const doneToday = allTasks.filter((k) => k.list === 'today' && !k.later && done[k.id]).length;
  const todayFocus = focusSessions.reduce(
    (n, s) => (s.startedAt >= startToday ? n + minutes(s.seconds) : n),
    0
  );
  const todayHabit = habitSessions.reduce(
    (n, s) => (s.startedAt >= startToday ? n + minutes(s.seconds) : n),
    0
  );
  const todayGain = doneToday * 10 + todayFocus + todayHabit;

  let level = 0;
  for (let i = 0; i < KARMA_THRESHOLDS.length; i++) {
    if (points >= KARMA_THRESHOLDS[i]) level = i;
  }
  const nextAt = KARMA_THRESHOLDS[level + 1] ?? null;

  return { points, level, nextAt, todayGain };
}

export function useOnThisDay(): Entry[] {
  const { entries } = useStore();
  const today = new Date();
  const key = monthDayKey(today);
  const todayKey = dayKey(today);
  return entries
    .filter((e) => e.day.slice(5) === key && e.day !== todayKey)
    .sort((a, b) => b.createdAt - a.createdAt);
}
