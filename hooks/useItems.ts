'use client';
import { useCallback, useEffect, useState } from 'react';
import { getSupabase, type Item } from '@/lib/supabase';

export function useItems(userId?: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    const db = getSupabase();
    if (!db) { setError('Supabase is not configured. Add the environment variables and redeploy.'); setLoading(false); return; }
    setLoading(true); setError('');
    let query = db.from('items').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const result = await query;
    if (result.error) setError(result.error.message);
    else setItems((result.data ?? []) as Item[]);
    setLoading(false);
  }, [userId]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { items, loading, error, refresh };
}
