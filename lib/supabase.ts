import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export type ItemStatus = 'lost' | 'found' | 'claim_pending' | 'returned' | 'closed';
export type ItemType = 'lost' | 'found';
export interface Item {
  id: string;
  user_id: string;
  title: string;
  item_type: ItemType;
  category: string;
  description: string;
  location: string;
  incident_date: string;
  image_path: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at?: string;
}
export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  proof_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string | null;
  items?: { title: string; location: string; image_path?: string | null } | null;
}
export const categories = ['ID Card', 'Wallet', 'Keys', 'Phone', 'Laptop', 'Earphones', 'Books', 'Bag', 'Bottle', 'Other'];
export const locations = ['Library', 'Canteen', 'Classroom', 'Laboratory', 'Auditorium', 'Parking Area', 'Sports Ground', 'Corridor', 'Office', 'Other'];

export function imageUrl(path: string | null): string | null {
  if (!path) return null;
  const db = getSupabase();
  return db ? db.storage.from('item-images').getPublicUrl(path).data.publicUrl : null;
}

export function formatDate(date: string): string {
  if (!date) return 'Unknown date';
  const parsed = new Date(date.includes('T') ? date : `${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

export function suggestMatches(item: Item, others: Item[]): { item: Item; score: number }[] {
  const words = item.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  return others.filter(c => c.id !== item.id && c.item_type !== item.item_type && !['returned', 'closed'].includes(c.status))
    .map(candidate => ({ item: candidate, score:
      (candidate.category === item.category ? 45 : 0) +
      (candidate.location === item.location ? 30 : 0) +
      (words.some(w => candidate.title.toLowerCase().includes(w)) ? 25 : 0),
    })).filter(result => result.score >= 45).sort((a, b) => b.score - a.score).slice(0, 4);
}
