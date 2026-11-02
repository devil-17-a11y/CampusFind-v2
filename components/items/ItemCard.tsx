'use client';
import Link from 'next/link';
import { Bookmark, CalendarDays, MapPin, PackageSearch } from 'lucide-react';
import { type Item, formatDate, imageUrl } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/Primitives';
import { useSaved } from '@/contexts/SavedContext';
export function ItemCard({item}:{item:Item}){
  const {has,toggle}=useSaved();
  const photo=imageUrl(item.image_path);
  return <article className="card group overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-0.5 hover:shadow-lg">
    <div className="h-48 relative bg-gradient-to-br from-blue-50 via-slate-100 to-teal-50 grid place-items-center overflow-hidden">
      {photo?<img src={photo} alt={`Photo of ${item.title}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"/>:<PackageSearch size={48} className="text-blue-200" aria-hidden="true"/>}
      <span className={`absolute left-4 top-4 px-3 py-1 rounded-full font-bold text-xs shadow-sm ${item.item_type==='lost'?'text-red-700 bg-red-50':'text-teal-700 bg-teal-50'}`}>{item.item_type==='lost'?'Lost item':'Found item'}</span>
      <button type="button" className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/95 shadow-sm grid place-items-center text-blue-700 hover:bg-blue-50" aria-label={has(item.id)?'Remove saved item':'Save item'} aria-pressed={has(item.id)} onClick={()=>toggle(item.id)}><Bookmark size={17} fill={has(item.id)?'currentColor':'none'}/></button>
    </div>
    <div className="p-5 flex-1 flex flex-col"><div className="flex justify-between items-center gap-2"><span className="pill">{item.category}</span><StatusBadge status={item.status}/></div>
      <h3 className="text-lg font-extrabold tracking-tight text-slate-900 mt-3 line-clamp-1">{item.title}</h3><p className="text-sm text-slate-500 leading-6 line-clamp-2 mt-2">{item.description}</p>
      <div className="flex flex-col gap-2 text-xs text-slate-500 mt-5"><span className="inline-flex gap-2 items-center"><MapPin size={14}/>{item.location}</span><span className="inline-flex gap-2 items-center"><CalendarDays size={14}/>{formatDate(item.incident_date)}</span></div>
      <Link href={`/items/${item.id}`} className="btn btn-soft w-full mt-5">View details <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
