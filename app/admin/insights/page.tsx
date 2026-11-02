'use client';
import { useCallback, useEffect, useState } from 'react';
import { BarChart3, CalendarDays, RefreshCcw, Users, Eye } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
type Dimension={name:string;views:number};
type Day={day:string;views:number;visitors:number};
type Metrics={views:number;visitors:number;daily:Day[];pages:Dimension[];sources:Dimension[];campaigns:Dimension[];devices:Dimension[]};
const initial:Metrics={views:0,visitors:0,daily:[],pages:[],sources:[],campaigns:[],devices:[]};
function TopRows({title,data}:{title:string;data:Dimension[]}){
  const max=Math.max(1,...data.map(v=>v.views));
  return <div className="card p-5"><h2 className="text-lg font-bold mb-5">{title}</h2>{data.length===0?<p className="text-sm text-slate-500">No consented traffic recorded in this period.</p>:<div className="grid gap-4">{data.map((d,i)=><div key={d.name+'-'+i}><div className="flex justify-between gap-3 text-sm mb-1"><span className="truncate">{d.name||'(none)'}</span><strong>{d.views}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{width:`${(d.views/max)*100}%`}}/></div></div>)}</div>}</div>
}
export default function InsightsPage(){
  const [days,setDays]=useState(30);const [metrics,setMetrics]=useState<Metrics>(initial);
  const [busy,setBusy]=useState(true);const [error,setError]=useState('');
  const refresh=useCallback(async()=>{setBusy(true);setError('');const db=getSupabase();if(!db){setError('Missing Supabase configuration');setBusy(false);return;}const {data,error}=await db.rpc('portal_insights',{p_days:days});if(error)setError(error.message+' — run supabase/feature_upgrade.sql and verify MFA.');else setMetrics((data??initial) as Metrics);setBusy(false)},[days]);
  useEffect(()=>{void refresh()},[refresh]);
  const max=Math.max(1,...metrics.daily.map(x=>x.views));
  return <div><div className="flex flex-wrap gap-4 justify-between items-start mb-7"><div><p className="text-xs font-bold tracking-widest uppercase text-blue-700">Campus insights</p><h1 className="text-3xl font-extrabold mt-1">Traffic & attribution</h1><p className="text-slate-500 mt-2">Privacy-conscious page views, visitor counts, sources, devices, campaigns and popular pages.</p></div><div className="flex gap-2"><label className="sr-only" htmlFor="period">Date range</label><select id="period" className="input" value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select><button className="btn btn-outline" onClick={()=>void refresh()} aria-label="Refresh insights"><RefreshCcw size={17}/></button></div></div>
  {error&&<p className="rounded-xl bg-rose-50 text-rose-700 p-4 mb-6" role="alert">{error}</p>}
  {busy?<div className="card p-8">Loading real traffic data…</div>:<><div className="grid gap-4 sm:grid-cols-2 mb-6"><div className="card p-6"><Eye className="text-blue-700"/><p className="text-sm text-slate-500 mt-4">Page views</p><p className="text-3xl font-extrabold">{Number(metrics.views||0).toLocaleString()}</p></div><div className="card p-6"><Users className="text-blue-700"/><p className="text-sm text-slate-500 mt-4">Anonymous visitors</p><p className="text-3xl font-extrabold">{Number(metrics.visitors||0).toLocaleString()}</p></div></div>
  <div className="card p-6 mb-5"><h2 className="font-bold flex items-center gap-2 mb-5"><BarChart3 size={20}/> Daily views</h2>{metrics.daily.length===0?<p className="text-slate-500 text-sm">No page views yet. Analytics start only after visitors consent.</p>:<div className="h-52 flex items-end gap-1 sm:gap-2" aria-label="Daily view chart">{metrics.daily.map(day=><div key={day.day} className="group flex-1 h-full flex flex-col justify-end items-center" title={`${day.day}: ${day.views} views`}><div className="bg-blue-600 hover:bg-blue-800 rounded-t w-full min-w-1" style={{height:`${Math.max(3,day.views/max*100)}%`}}/><span className="text-[9px] text-slate-500 mt-2 hidden sm:block">{day.day.slice(5)}</span></div>)}</div>}</div>
  <div className="grid md:grid-cols-2 gap-5"><TopRows title="Popular pages" data={metrics.pages}/><TopRows title="Acquisition sources" data={metrics.sources}/><TopRows title="UTM campaigns" data={metrics.campaigns}/><TopRows title="Devices" data={metrics.devices}/></div></>}
  <p className="text-xs text-slate-500 mt-5 flex gap-2"><CalendarDays size={15}/>Counts include only opted-in visitors. They are not equivalent to GA4 sessions or Google Search Console clicks. No personal search terms are collected.</p>
  </div>;
}
