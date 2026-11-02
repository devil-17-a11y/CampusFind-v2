'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

type AuthContextValue = { user: User | null; role: 'student' | 'admin' | 'super_admin'; loading: boolean; configured: boolean; refreshRole: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
const db = getSupabase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student'|'admin'|'super_admin'>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    let live = true;
    db.auth.getUser().then(({ data, error }) => {
      if (!live) return;
      setUser(error ? null : data.user);
      setLoading(false);
    }).catch(() => { if (live) setLoading(false); });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      if (live) { setUser(session?.user ?? null); setLoading(false); }
    });
    return () => { live = false; subscription.unsubscribe(); };
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!db || !userId) { setRole('student'); return; }
    let live = true;
    setRole('student');
    db.from('profiles').select('role').eq('id', userId).single().then(({ data }) => {
      if (live) setRole(data?.role === 'super_admin' ? 'super_admin' : data?.role === 'admin' ? 'admin' : 'student');
    });
    return () => { live = false; };
  }, [userId]);

  const refreshRole = async () => {
    if (!db || !userId) return;
    const { data } = await db.from('profiles').select('role').eq('id', userId).single();
    setRole(data?.role === 'super_admin' ? 'super_admin' : data?.role === 'admin' ? 'admin' : 'student');
  };
  const signOut = async () => { if (db) await db.auth.signOut(); setRole('student'); };
  const value = useMemo(() => ({ user, role, loading, configured: !!db, refreshRole, signOut }), [user, role, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
