'use client';
import { useEffect, useState } from 'react';
import { Activity, RefreshCcw } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
type Probe={name:string;ok:boolean;message:string};
export default function HealthPage(){const [checks,setChecks]=useState<Probe[]>([]);const [busy,setBusy]=useState(false);
 async function run(){setBusy(true);const db=getSupabase();if(!db){setChecks([{name:'Supabase configuration',ok:false,message:'URL and key are missing'}]);setBusy(false);return;}
 const results=await Promise.all([
  db.from('items').select('id',{count:'exact',head:true}).then(({error})=>({name:'Item records',ok:!error,message:error?.message||'Database reachable'})),
  db.from('claims').select('id',{count:'exact',head:true}).then(({error})=>({name:'Ownership claims',ok:!error,message:error?.message||'Authorized query succeeded'})),
  db.from('portal_settings').select('singleton',{count:'exact',head:true}).then(({error})=>({name:'Analytics migration',ok:!error,message:error?.message||'Settings table reachable'})),
  Promise.resolve({name:'Image storage configuration',ok:!!db.storage.from('item-images').getPublicUrl('health-check.png').data.publicUrl,message:'Public URL configuration is present; actual file uploads require a separate test'}),
  db.auth.getUser().then(({data,error})=>({name:'Authenticated session',ok:!!data?.user&&!error,message:error?.message|| (data?.user?'Session active':'Sign in required')})),
 ]);setChecks(results);setBusy(false)}
 useEffect(()=>{void run()},[]);
 return <div><div className="flex justify-between gap-2 items-center mb-6"><div><h1 className="text-3xl font-extrabold">System health</h1><p className="text-slate-500 mt-2">Live checks against your configured Supabase project.</p></div><button className="btn btn-outline" disabled={busy} onClick={()=>void run()}><RefreshCcw size={16}/>Run checks</button></div><div className="grid gap-3">{checks.map(c=><div key={c.name} className="card p-5 flex items-center gap-3"><Activity className={c.ok?'text-emerald-600':'text-rose-600'} size={22}/><div className="min-w-0"><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-500 break-words">{c.message}</p></div><span className={'ml-auto text-xs font-bold '+(c.ok?'text-emerald-600':'text-rose-700')}>{c.ok?'OK':'Check'}</span></div>)}</div><p className="text-xs text-slate-500 mt-6">These are connectivity checks, not full penetration testing or guaranteed uptime monitoring.</p></div>;
}
