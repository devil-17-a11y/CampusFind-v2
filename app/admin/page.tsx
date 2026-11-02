'use client';
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { formatDate, getSupabase, type Claim } from '@/lib/supabase';
import { Alert, PageHeading, RequireAuth, StatusBadge } from '@/components/ui/Primitives';
import { ItemCard } from '@/components/items/ItemCard';
export default function AdminPage(){
  const {user,role,loading:authLoading}=useAuth();const {items,refresh}=useItems();
  const [claims,setClaims]=useState<Claim[]>([]);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
  const canAccess=!!user&&(role==='admin'||role==='super_admin');
  const load=useCallback(async()=>{const db=getSupabase();if(!db||!canAccess)return;const {data,error}=await db.from('claims').select('id,item_id,claimant_id,proof_description,status,created_at,items(title,location)').order('created_at',{ascending:false});if(error)setError(error.message);else{setClaims((data??[]) as unknown as Claim[]);setError('');}},[canAccess]);
  useEffect(()=>{void load();},[load]);
  async function review(id:string,decision:'approved'|'rejected'){
    const db=getSupabase();if(!db||!canAccess)return;
    if(decision==='approved'&&!window.confirm('Confirm that you have verified ownership and are ready to mark this item as returned?'))return;
    setBusy(true);setNotice('');setError('');const {error}=await db.rpc('review_ownership_claim',{p_claim_id:id,p_decision:decision});if(error)setError(error.message);else setNotice(`Claim ${decision}. Item status refreshed.`);await Promise.all([load(),refresh()]);setBusy(false);
  }
  if(authLoading)return <section className="container-site py-16">Checking authorization…</section>;
  if(!canAccess)return <RequireAuth admin/>;
  const pending=claims.filter(c=>c.status==='pending');
  return <section className="py-2"><PageHeading eyebrow="Staff workspace" title="Administration" subtitle="Review ownership claims and manage responsible item handovers."><button onClick={()=>{void load();void refresh();}} className="btn btn-outline"><RotateCcw size={16}/>Refresh</button></PageHeading>
    <div className="grid sm:grid-cols-3 gap-4 mb-9">{[['Pending claims',pending.length],['Total claims',claims.length],['Item reports',items.length]].map(([label,val])=><div className="card p-6" key={label}><p className="text-sm text-slate-500 font-semibold">{label}</p><p className="text-3xl font-extrabold text-blue-700 mt-2">{val}</p></div>)}</div>
    <Alert message={error}/><Alert message={notice} variant="success"/>
    <h2 className="font-extrabold text-2xl mb-5">Ownership claim reviews</h2>{claims.length===0?<div className="card p-10 text-center text-slate-500">No claims to review.</div>:<div className="grid gap-4">{claims.map(c=><div key={c.id} className="card p-5 sm:p-6"><div className="flex gap-4 flex-wrap justify-between"><div><h3 className="font-extrabold text-lg">{c.items?.title??'Found item'}</h3><p className="text-slate-500 text-sm mt-1">{c.items?.location} · Submitted {formatDate(c.created_at)}</p></div><StatusBadge status={c.status}/></div><div className="bg-slate-50 rounded-xl p-4 mt-4 text-sm"><p className="font-bold text-slate-700 mb-2">Private ownership proof</p><p className="whitespace-pre-wrap text-slate-600">{c.proof_description}</p></div>{c.status==='pending'&&<div className="flex flex-wrap gap-3 mt-5"><button disabled={busy} className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>void review(c.id,'approved')}><CheckCircle2 size={17}/>Approve and return</button><button disabled={busy} className="btn bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={()=>void review(c.id,'rejected')}><XCircle size={17}/>Reject</button></div>}</div>)}</div>}
    <h2 className="font-extrabold text-2xl mb-5 mt-12 flex items-center gap-2"><ShieldCheck size={23} className="text-blue-700"/> Recent reports</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.slice(0,6).map(item=><ItemCard key={item.id} item={item}/>)}</div>
  </section>;
}
