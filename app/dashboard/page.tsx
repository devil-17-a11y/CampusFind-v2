'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowRight, FilePlus2, PackageOpen, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { ItemCard } from '@/components/items/ItemCard';
import { Alert, EmptyState, PageHeading, RequireAuth } from '@/components/ui/Primitives';
function DashboardContent() {
  const {user, role,loading:authLoading}=useAuth();
  const {items,loading,error,refresh}=useItems(user?.id);
  const [welcome,setWelcome]=useState(false);
  const params=useSearchParams();
  useEffect(()=>{setWelcome(params.get('created')==='1');},[params]);
  if(authLoading)return <section className="container-site py-16">Loading your dashboard…</section>;
  if(!user)return <RequireAuth/>;
  const name=typeof user.user_metadata?.full_name==='string' ? user.user_metadata.full_name.split(' ')[0] : 'there';
  const stats={total:items.length,lost:items.filter(i=>i.item_type==='lost').length,found:items.filter(i=>i.item_type==='found').length,returned:items.filter(i=>i.status==='returned').length};
  return <section className="container-site py-12 sm:py-16"><PageHeading eyebrow="Your workspace" title={`Welcome back, ${name}`} subtitle="Manage your reports and check their latest status."><Link href="/report" className="btn btn-primary"><FilePlus2 size={17}/>New report</Link></PageHeading>
    {welcome&&<Alert variant="success" message="Your item report was successfully published."/>}<Alert message={error}/>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">{[['Total reports',stats.total],['Lost reports',stats.lost],['Found reports',stats.found],['Returned',stats.returned]].map(([label,val])=><div key={label} className="card p-5 sm:p-6"><p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{label}</p><p className="text-3xl font-extrabold text-blue-700 mt-2">{loading?'…':val}</p></div>)}</div>
    <div className="grid lg:grid-cols-[1fr_300px] gap-7"><div><div className="flex justify-between items-center mb-5"><h2 className="text-2xl font-extrabold">My reported items</h2><button className="btn btn-outline" onClick={()=>void refresh()}><RotateCcw size={16}/>Refresh</button></div>{loading?<p className="text-slate-500">Loading your reports…</p>:items.length?<div className="grid sm:grid-cols-2 gap-5">{items.map(item=><ItemCard item={item} key={item.id}/>)}</div>:<EmptyState title="No reports yet" description="Start by reporting an item you lost or found." action="Create a report" href="/report"/>}</div>
    <aside><div className="card p-6"><h3 className="font-extrabold text-xl">Quick actions</h3><div className="mt-5 space-y-3"><Link href="/claims" className="flex justify-between items-center text-sm font-semibold text-blue-700 p-3 bg-blue-50 rounded-xl">My ownership claims<ArrowRight size={16}/></Link><Link href="/browse?saved=1" className="flex justify-between items-center text-sm font-semibold text-blue-700 p-3 bg-blue-50 rounded-xl">Saved items<ArrowRight size={16}/></Link>{role==='admin'&&<Link href="/admin" className="flex justify-between items-center text-sm font-semibold text-blue-700 p-3 bg-blue-50 rounded-xl"><span className="flex gap-2 items-center"><ShieldCheck size={16}/>Admin area</span><ArrowRight size={16}/></Link>}</div></div><div className="card p-6 mt-5 bg-[#edf5ff]"><PackageOpen size={23} className="text-blue-700"/><h3 className="font-bold mt-3">Keep descriptions safe</h3><p className="text-sm text-slate-600 leading-6 mt-2">Do not publish private ownership details in a public report. Share them with staff via a claim.</p></div></aside></div>
  </section>;
}
export default function Dashboard(){return <Suspense fallback={<div className="container-site py-14">Loading dashboard…</div>}><DashboardContent/></Suspense>}
