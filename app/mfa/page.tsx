'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFrame } from '@/components/auth/AuthFrame';
export default function MfaPage(){
 const {user,loading}=useAuth();const router=useRouter();
 const [factorId,setFactorId]=useState('');const [code,setCode]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{if(!user)return;const db=getSupabase();if(!db)return;
  void Promise.all([db.auth.mfa.listFactors(),db.auth.mfa.getAuthenticatorAssuranceLevel()]).then(([list,level])=>{
   if(level.data?.currentLevel==='aal2'){router.replace('/admin');return;}
   if(list.error){setError(list.error.message);return;}
   const factor=list.data?.totp?.find(f=>f.status==='verified');
   if(factor)setFactorId(factor.id);else setError('No verified authenticator found. Set one up in Account Security.');
  });},[user,router]);
 async function verify(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db||!factorId)return;setBusy(true);setError('');const {error}=await db.auth.mfa.challengeAndVerify({factorId,code:code.trim()});setBusy(false);if(error)setError(error.message);else{router.replace('/admin');router.refresh()}}
 if(loading)return <p className="container-site py-16">Checking session…</p>;
 if(!user)return <p className="container-site py-16">Please <Link href="/login" className="underline text-blue-700">sign in</Link> first.</p>;
 return <AuthFrame title="Verify your identity" subtitle="Enter the 6-digit code from your authenticator app to unlock protected staff tools."><form onSubmit={verify} className="space-y-4"><label className="label" htmlFor="totp">Authenticator code</label><input id="totp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="input" value={code} onChange={e=>setCode(e.target.value)} required/>{error&&<p role="alert" className="text-rose-700 text-sm">{error}</p>}<button disabled={busy||!factorId} className="btn btn-primary w-full">{busy?'Verifying…':'Verify code'}</button><Link className="block text-sm text-blue-700 font-semibold" href="/account/security">Manage authenticator</Link></form></AuthFrame>;
}
