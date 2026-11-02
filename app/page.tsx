'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FilePlus2, Handshake, MapPin, PackageSearch, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useItems } from '@/hooks/useItems';
import { ItemCard } from '@/components/items/ItemCard';

export default function Home() {
  const { items, loading } = useItems();
  const recent = items.filter(i=>!['returned','closed'].includes(i.status)).slice(0,3);
  const count = { lost:items.filter(i=>i.item_type==='lost').length, found:items.filter(i=>i.item_type==='found').length, returned:items.filter(i=>i.status==='returned').length };
  return <>
    <section className="relative overflow-hidden bg-[#102e5a] text-white"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_15%,rgba(38,129,216,.47),transparent_48%)]" aria-hidden="true"/>
      <div className="container-site py-20 sm:py-24 lg:py-28 relative grid lg:grid-cols-2 gap-12 items-center">
        <div><div className="inline-flex gap-2 items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold mb-7"><Sparkles size={16}/> Made for your campus community</div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.07]">Lost something?<br/><span className="text-[#93d8ff]">Let’s find it.</span></h1>
          <p className="mt-6 text-lg text-blue-100/85 max-w-xl leading-8">One organized place to report missing belongings, explore found items and request a secure return.</p>
          <div className="mt-8 flex gap-3 flex-wrap"><Link href="/browse" className="btn bg-white text-blue-800 hover:bg-blue-50"><Search size={18}/>Find an item <ArrowRight size={16}/></Link><Link href="/report" className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20"><FilePlus2 size={18}/>Report an item</Link></div>
          <p className="mt-8 text-sm text-blue-200/90 flex items-center gap-2"><ShieldCheck size={17}/> Ownership claims are reviewed by authorized staff</p>
        </div>
        <div className="relative"><div className="absolute -inset-3 bg-white/5 rounded-[36px] blur-xl"/><div className="relative bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between"><div><p className="text-xs text-blue-600 font-extrabold tracking-widest uppercase">Campus Activity</p><h2 className="text-2xl font-extrabold mt-1">At a glance</h2></div><div className="bg-blue-50 text-blue-700 p-3 rounded-xl"><PackageSearch size={25}/></div></div>
          <div className="grid grid-cols-3 gap-3 mt-7">{[['Lost',count.lost],['Found',count.found],['Returned',count.returned]].map(([label,value])=><div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center" key={label}><p className="text-3xl font-extrabold text-[#195eb7]">{loading?'—':value}</p><p className="text-xs text-slate-500 mt-1">{label}</p></div>)}</div>
          <div className="border-t border-slate-100 mt-7 pt-6 space-y-4">{[['Report with photos','Add clear details about an item'],['Search campus locations','Narrow results by place or category'],['Recover responsibly','Staff review proof before handover']].map(([title,desc])=><div key={title} className="flex gap-3 items-start"><CheckCircle2 className="text-emerald-600 shrink-0" size={20}/><div><p className="text-sm font-bold">{title}</p><p className="text-slate-500 text-xs mt-1">{desc}</p></div></div>)}</div>
        </div></div>
      </div></section>
    <section className="container-site py-18 sm:py-20"><div className="text-center"><p className="eyebrow">Simple process</p><h2 className="heading-xl mt-2">How CampusFind works</h2><p className="text-slate-500 mt-3">From missing to reunited in three straightforward steps.</p></div>
      <div className="grid md:grid-cols-3 gap-5 mt-10">{[
        {I:FilePlus2,n:'01',t:'Report an item',d:'Share what you lost or found, where it happened, and an optional image.'},
        {I:Search,n:'02',t:'Browse and match',d:'Use keyword, category and location filters to discover possible matches.'},
        {I:Handshake,n:'03',t:'Verify and collect',d:'Submit a private claim. Staff verify ownership before returning the item.'}
      ].map(({I,n,t,d})=><div className="card p-7" key={n}><div className="flex justify-between items-center"><span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center"><I size={23}/></span><span className="text-3xl text-blue-100 font-black">{n}</span></div><h3 className="text-xl font-extrabold mt-6">{t}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{d}</p></div>)}</div>
    </section>
    <section className="bg-white border-y border-slate-100"><div className="container-site py-16"><div className="flex items-end justify-between gap-4 flex-wrap mb-8"><div><p className="eyebrow mb-2">Recently added</p><h2 className="heading-xl">Latest reports</h2><p className="text-slate-500 mt-2">Recently reported items across your campus</p></div><Link href="/browse" className="btn btn-outline">Browse all <ArrowRight size={17}/></Link></div>
      {recent.length>0?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{recent.map(item=><ItemCard key={item.id} item={item}/>)}</div>:<div className="card p-10 text-center"><MapPin className="mx-auto text-blue-300" size={36}/><h3 className="font-bold text-lg mt-3">No reports yet</h3><p className="text-slate-500 text-sm mt-2">Be the first to help someone find their belongings.</p><Link href="/report" className="btn btn-primary mt-5">Create a report</Link></div>}</div></section>
    <section className="container-site py-18"><div className="bg-[#edf5ff] rounded-3xl p-8 md:p-12 flex flex-wrap justify-between items-center gap-6"><div><p className="eyebrow">Make a difference</p><h2 className="text-3xl font-extrabold mt-2 tracking-tight">Found something on campus?</h2><p className="text-slate-600 mt-3 max-w-xl">One short report could help return something important to its owner.</p></div><Link href="/report" className="btn btn-primary">Report a found item <ArrowRight size={18}/></Link></div></section>
  </>;
}
