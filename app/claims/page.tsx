'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, getSupabase, type Claim } from '@/lib/supabase';
import { Alert, EmptyState, PageHeading, RequireAuth, StatusBadge } from '@/components/ui/Primitives';
export default function ClaimsPage(){
  const {user,loading:authLoading}=useAuth();const [claims,setClaims]=useState<Claim[]>([]);const [busy,setBusy]=useState(true);const [error,setError]=useState('');
  const userId=user?.id;
  useEffect(()=>{const db=getSupabase();if(!db||!userId){setBusy(false);return;}let live=true;
    db.from('claims').select('id,item_id,claimant_id,proof_description,status,created_at,items(title,location)').eq('claimant_id',userId).order('created_at',{ascending:false})
      .then(({data,error})=>{if(!live)return;if(error)setError(error.message);else setClaims((data??[]) as unknown as Claim[]);setBusy(false);});
    return()=>{live=false};
  },[userId]);
  if(authLoading)return <div className="container-site py-14">Loading claims…</div>;
  if(!user)return <RequireAuth/>;
  return <section className="container-site py-12 sm:py-16"><PageHeading eyebrow="Your activity" title="My ownership claims" subtitle="Review the status of requests you submitted to campus staff."/>
    <Alert message={error}/>{busy?<p className="text-slate-500">Loading claims…</p>:claims.length?<div className="grid gap-4 max-w-4xl">{claims.map(c=><div key={c.id} className="card p-6 flex flex-col sm:flex-row justify-between gap-4"><div><h2 className="text-xl font-bold">{c.items?.title??'Found item'}</h2><p className="text-slate-500 text-sm mt-2">{c.items?.location??'Campus'} · Submitted {formatDate(c.created_at)}</p><p className="text-slate-500 text-sm mt-3">{c.status==='pending'?'Waiting for staff verification.':c.status==='approved'?'Claim approved. Contact campus staff to arrange collection.':'Claim not approved. Please contact campus staff if you need assistance.'}</p></div><div className="self-start"><StatusBadge status={c.status}/></div></div>)}</div>:<EmptyState title="No claims submitted" description="Find a reported item that belongs to you and submit identifying details privately for staff review." action="Browse found items" href="/browse"/>}
    <div className="mt-7 text-sm text-slate-500 flex gap-2 items-center"><ClipboardCheck size={17}/> Staff verify claims before returning an item. <Link href="/browse" className="font-bold text-blue-700">Browse items</Link></div>
  </section>;
}
