import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Task, tasks } from '../data/seed';

export type HabitSession = { startedAt: number; seconds: number };

type Store = {
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  cleared: Record<string, boolean>;
  clear: (id: string) => void;
  added: Task[];
  habitSessions: HabitSession[];
  addHabitSession: (session: HabitSession) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
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
      habitSessions,
      addHabitSession: (session) => setHabitSessions((s) => [...s, session]),
      qa,
      setQa,
      sel,
      setSel,
    }),
    [done, cleared, added, habitSessions, qa, sel]
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
