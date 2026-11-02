'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
type SavedValue = { saved: string[]; toggle: (id: string) => void; has: (id: string) => boolean };
const SavedContext = createContext<SavedValue | null>(null);
const storageKey = 'campusfind-saved-v2';
export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(value)) setSaved(value.filter((v): v is string => typeof v === 'string'));
    } catch { /* no saved items */ }
  }, []);
  const toggle = (id: string) => setSaved(old => {
    const next = old.includes(id) ? old.filter(x => x !== id) : [...old, id];
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* private browsing */ }
    return next;
  });
  const value = useMemo(() => ({ saved, toggle, has: (id: string) => saved.includes(id) }), [saved]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be inside SavedProvider');
  return ctx;
}
