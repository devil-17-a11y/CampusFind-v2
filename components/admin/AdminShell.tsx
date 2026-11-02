'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Activity, BarChart3, DatabaseBackup, LayoutDashboard, Settings2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';

type State = 'checking'|'enroll'|'verify'|'ready'|'error';
const sections = [
  {href:'/admin',label:'Overview & claims',icon:LayoutDashboard},
  {href:'/admin/insights',label:'Traffic & attribution',icon:BarChart3},
  {href:'/admin/settings',label:'Analytics settings',icon:Settings2},
  {href:'/admin/security',label:'Security & audit',icon:ShieldCheck},
  {href:'/admin/backup',label:'Data backups',icon:DatabaseBackup},
  {href:'/admin/health',label:'System health',icon:Activity},
];
export function AdminShell({children}:{children:ReactNode}){
  const {user,role,loading}=useAuth();
  const path=usePathname();
  const [state,setState]=useState<State>('checking');
  useEffect(()=>{
    if(loading||!user||role!=='admin')return;
    let active=true;
    getSupabase()?.auth.mfa.getAuthenticatorAssuranceLevel().then(({data,error})=>{
      if(!active)return;
      if(error){setState('error');return;}
      setState(data?.currentLevel==='aal2'?'ready':data?.nextLevel==='aal2'?'verify':'enroll');
    }).catch(()=>{if(active)setState('error')});
    return()=>{active=false};
  },[loading,user,role]);
  if(loading||!!user&&role==='admin'&&state==='checking') return <div className="container-site py-20">Checking administrator access…</div>;
  if(!user||role!=='admin')return <div className="container-site py-20 card p-8"><h1 className="text-2xl font-bold">Restricted staff workspace</h1><p className="mt-3">An authorized administrator account is required.</p><Link href="/login" className="btn btn-primary mt-5">Sign in</Link></div>;
  if(state!=='ready')return <section className="container-site py-16"><div className="card p-8 max-w-xl"><ShieldCheck className="text-blue-700" size={32}/><h1 className="text-2xl font-bold mt-3">Secure your staff access</h1><p className="text-slate-600 mt-2">The administration area requires authenticator-app verification. This protects ownership evidence, reporting data and settings.</p><Link className="btn btn-primary mt-5" href={state==='verify'?'/mfa':'/account/security'}>{state==='verify'?'Verify authenticator code':'Set up an authenticator'}</Link>{state==='error'&&<p className="text-rose-700 mt-3">Could not verify your authentication level. Check Supabase MFA settings and retry.</p>}</div></section>;
  return <div className="container-site py-7 lg:py-10 grid gap-6 lg:grid-cols-[235px_minmax(0,1fr)]">
    <aside className="card p-4 lg:sticky lg:top-24 lg:self-start"><p className="px-3 pt-2 pb-3 uppercase text-xs tracking-widest font-bold text-slate-500">Staff workspace</p><nav aria-label="Administration tools" className="grid gap-1">{sections.map(({href,label,icon:Icon})=><Link key={href} href={href} className={'flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-sm '+(path===href?'bg-blue-50 text-blue-800':'text-slate-600 hover:bg-slate-100')}><Icon size={18}/>{label}</Link>)}</nav><Link href="/account/security" className="block px-3 pt-5 text-xs font-semibold text-blue-700">My account security</Link></aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
