'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { AuthFrame } from '@/components/auth/AuthFrame';
import { Alert } from '@/components/ui/Primitives';
export default function LoginPage(){
  const router=useRouter();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db){setError('Supabase settings are missing.');return;}setBusy(true);setError('');const {error}=await db.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setError(error.message);else{setPassword('');const level=await db.auth.mfa.getAuthenticatorAssuranceLevel();router.replace(level.data?.nextLevel==='aal2'&&level.data?.currentLevel!=='aal2'?'/mfa':'/dashboard');router.refresh();}}
  return <AuthFrame title="Welcome back" subtitle="Sign in to report belongings, track your reports and submit ownership claims."><form className="space-y-5" onSubmit={submit}><div><label htmlFor="email" className="label">Email address</label><input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@college.edu"/></div><div><div className="flex justify-between items-center"><label htmlFor="password" className="label">Password</label><Link href="/forgot-password" className="text-xs text-blue-700 font-bold mb-2">Forgot password?</Link></div><input id="password" className="input" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></div><Alert message={error}/><button className="btn btn-primary w-full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><p className="text-center text-sm text-slate-600 mt-6">New to CampusFind? <Link href="/signup" className="text-blue-700 font-bold">Create an account</Link></p></AuthFrame>;
}
