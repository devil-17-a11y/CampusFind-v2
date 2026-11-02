'use client';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { categories, locations, type Item } from '@/lib/supabase';
import { useItems } from '@/hooks/useItems';
import { useSaved } from '@/contexts/SavedContext';
import { ItemCard } from '@/components/items/ItemCard';
import { Alert, EmptyState, PageHeading } from '@/components/ui/Primitives';

function BrowseContent() {
  const params = useSearchParams();
  const { items, loading, error, refresh } = useItems();
  const { saved } = useSaved();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [sort, setSort] = useState('newest');
  const [savedOnly, setSavedOnly] = useState(params.get('saved') === '1');
  const results = useMemo(() => items.filter(item =>
    (type === 'all' || item.item_type === type) &&
    (category === 'all' || item.category === category) &&
    (location === 'all' || item.location === location) &&
    (!savedOnly || saved.includes(item.id)) &&
    [item.title,item.description,item.location].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a:Item,b:Item) => sort === 'oldest' ? a.created_at.localeCompare(b.created_at) : sort === 'title' ? a.title.localeCompare(b.title) : b.created_at.localeCompare(a.created_at)), [items, query, type, category, location, sort, savedOnly, saved]);
  const clear = () => {setQuery('');setType('all');setCategory('all');setLocation('all');setSort('newest');setSavedOnly(false);};
  return <section className="container-site py-12 sm:py-16">
    <PageHeading eyebrow="Explore campus reports" title="Find a lost or found item" subtitle="Browse recent reports and narrow the results to what matters."><button type="button" onClick={()=>void refresh()} className="btn btn-outline"><RotateCcw size={16}/> Refresh</button></PageHeading>
    <div className="card p-5 md:p-6 mb-8"><div className="grid lg:grid-cols-12 gap-4"><div className="lg:col-span-4"><label className="label" htmlFor="browse-search">Search items</label><div className="relative"><Search size={18} className="absolute left-3 top-3.5 text-slate-400"/><input id="browse-search" value={query} onChange={e=>setQuery(e.target.value)} className="input pl-10" placeholder="Try 'wallet', 'black bag'…"/></div></div>
      <div className="lg:col-span-2"><label className="label" htmlFor="type-filter">Item type</label><select id="type-filter" className="input" value={type} onChange={e=>setType(e.target.value)}><option value="all">All items</option><option value="lost">Lost</option><option value="found">Found</option></select></div>
      <div className="lg:col-span-2"><label className="label" htmlFor="category-filter">Category</label><select id="category-filter" className="input" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(v=><option key={v}>{v}</option>)}</select></div>
      <div className="lg:col-span-2"><label className="label" htmlFor="location-filter">Location</label><select id="location-filter" className="input" value={location} onChange={e=>setLocation(e.target.value)}><option value="all">All locations</option>{locations.map(v=><option key={v}>{v}</option>)}</select></div>
      <div className="lg:col-span-2"><label className="label" htmlFor="sort-filter">Sort</label><select id="sort-filter" className="input" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title A–Z</option></select></div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-slate-100"><label className="text-sm font-semibold flex gap-2 items-center text-slate-600 cursor-pointer"><input type="checkbox" checked={savedOnly} onChange={e=>setSavedOnly(e.target.checked)} className="accent-blue-700 h-4 w-4"/><Bookmark size={16}/> Saved items only</label><button onClick={clear} className="text-sm font-bold text-blue-700 flex gap-2 items-center"><SlidersHorizontal size={16}/>Clear all filters</button></div>
    </div>
    <Alert message={error}/><div className="flex justify-between items-center gap-3 mb-5"><p className="text-slate-600 font-semibold text-sm">{loading?'Loading reports…':`${results.length} ${results.length===1?'result':'results'} found`}</p><p className="text-xs text-slate-500">Bookmarks are saved on this browser</p></div>
    {loading?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i=><div key={i} className="card h-96 animate-pulse bg-slate-100"/>)}</div>:results.length?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{results.map(item=><ItemCard key={item.id} item={item}/>)}</div>:<EmptyState title="No matching items" description="Try removing a filter or searching for a different item. You can also create a new report." action="Report an item" href="/report"/>}
  </section>;
}
export default function BrowsePage(){ return <Suspense fallback={<section className="container-site py-16">Loading items…</section>}><BrowseContent/></Suspense>; }
