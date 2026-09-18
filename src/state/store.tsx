import React, { createContext, useContext, useMemo, useState } from 'react';

type Store = {
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  cleared: Record<string, boolean>;
  clear: (id: string) => void;
  qa: string;
  setQa: (v: string) => void;
  sel: number;
  setSel: (d: number) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [cleared, setCleared] = useState<Record<string, boolean>>({});
  const [qa, setQa] = useState('Call dentist tomorrow 3pm #health');
  const [sel, setSel] = useState(18);

  const value = useMemo<Store>(
    () => ({
      done,
      toggle: (id) => setDone((d) => ({ ...d, [id]: !d[id] })),
      cleared,
      clear: (id) => setCleared((k) => ({ ...k, [id]: true })),
      qa,
      setQa,
      sel,
      setSel,
    }),
    [done, cleared, qa, sel]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
