import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Project, projects, Task, tasks } from '../data/seed';

export type Habit = { id: string; name: string; streak: number };

export type HabitSession = { habitId: string; startedAt: number; seconds: number };

type Store = {
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  cleared: Record<string, boolean>;
  clear: (id: string) => void;
  added: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  addedProjects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  addedHabits: Habit[];
  addHabit: (name: string) => void;
  habitSessions: HabitSession[];
  addHabitSession: (session: HabitSession) => void;
  qa: string;
  setQa: (v: string) => void;
  sel: number;
  setSel: (d: number) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [cleared, setCleared] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Task[]>([]);
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const [addedHabits, setAddedHabits] = useState<Habit[]>([]);
  const [habitSessions, setHabitSessions] = useState<HabitSession[]>([]);
  const [qa, setQa] = useState('Call dentist tomorrow 3pm #health');
  const [sel, setSel] = useState(18);

  const value = useMemo<Store>(
    () => ({
      done,
      toggle: (id) => setDone((d) => ({ ...d, [id]: !d[id] })),
      cleared,
      clear: (id) => setCleared((k) => ({ ...k, [id]: true })),
      added,
      addTask: (task) => setAdded((a) => [...a, { ...task, id: `a${a.length + 1}` }]),
      addedProjects,
      addProject: (project) =>
        setAddedProjects((p) => [...p, { ...project, id: `p${p.length + 1}` }]),
      addedHabits,
      addHabit: (name) =>
        setAddedHabits((h) => [...h, { id: `g${h.length + 1}`, name, streak: 0 }]),
      habitSessions,
      addHabitSession: (session) => setHabitSessions((s) => [...s, session]),
      qa,
      setQa,
      sel,
      setSel,
    }),
    [done, cleared, added, addedProjects, addedHabits, habitSessions, qa, sel]
  );

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
  return [...tasks(t, ar), ...added].filter((k) => !cleared[k.id]);
}

export function useProjects() {
  const { t } = useTheme();
  const { addedProjects } = useStore();
  return [...projects(t), ...addedProjects];
}

export function useHabits(): Habit[] {
  const { t } = useTheme();
  const { addedHabits } = useStore();
  return [{ id: 'h1', name: t.habit1, streak: 12 }, ...addedHabits];
}
