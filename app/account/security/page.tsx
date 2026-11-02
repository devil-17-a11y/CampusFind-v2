'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, ShieldCheck, ShieldPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
type Factor={id:string;friendly_name?:string;status:string};
export default function AccountSecurityPage(){
 const {user,loading}=useAuth();
 const [factors,setFactors]=useState<Factor[]>([]);
 const [enrollment,setEnrollment]=useState<{id:string;qr:string;secret:string}|null>(null);
 const [code,setCode]=useState('');const [password,setPassword]=useState('');
 const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 const [aal,setAal]=useState('');
 async function load(){const db=getSupabase();if(!db||!user)return;
  const [list,level]=await Promise.all([db.auth.mfa.listFactors(),db.auth.mfa.getAuthenticatorAssuranceLevel()]);
  if(list.error)setError(list.error.message);else setFactors((list.data?.totp||[]) as Factor[]);
  if(level.data)setAal(level.data.currentLevel);
 }
 useEffect(()=>{void load()},[user]);
 async function enroll(){const db=getSupabase();if(!db)return;setBusy(true);setError('');setNotice('');const {data,error}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'CampusFind authenticator'});setBusy(false);if(error)setError(error.message);else if(data?.totp)setEnrollment({id:data.id,qr:data.totp.qr_code,secret:data.totp.secret})}
 async function verifyEnrollment(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db||!enrollment)return;setBusy(true);setError('');const {error}=await db.auth.mfa.challengeAndVerify({factorId:enrollment.id,code:code.trim()});setBusy(false);if(error)setError(error.message);else{setEnrollment(null);setCode('');setNotice('Authenticator enabled and verified.');await load()}}
 async function changePassword(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db)return;setError('');setNotice('');if(password.length<12){setError('Choose at least 12 characters.');return;}setBusy(true);const {error}=await db.auth.updateUser({password});setBusy(false);if(error)setError(error.message);else{setPassword('');setNotice('Password updated.')}}
 async function signOutOtherSessions(){const db=getSupabase();if(!db)return;setBusy(true);setError('');const {error}=await db.auth.signOut({scope:'others'});setBusy(false);if(error)setError(error.message);else setNotice('Other sessions have been signed out. Existing access tokens may remain valid until expiry.');}
 if(loading)return <div className="container-site py-16">Loading account security…</div>;
 if(!user)return <div className="container-site py-16"><p>Please <Link href="/login" className="text-blue-700 underline">sign in</Link> to manage account security.</p></div>;
 const hasFactor=factors.some(f=>f.status==='verified');
 return <section className="container-site py-12 max-w-4xl"><p className="text-xs text-blue-700 uppercase tracking-widest font-bold">My account</p><h1 className="text-3xl font-extrabold mt-1">Security center</h1><p className="text-slate-600 mt-2 mb-7">Manage your password, authenticator and active sessions.</p>
 {error&&<div role="alert" className="p-4 bg-rose-50 text-rose-700 rounded-xl mb-4">{error}</div>}{notice&&<div role="status" className="p-4 bg-emerald-50 text-emerald-800 rounded-xl mb-4">{notice}</div>}
 <div className="grid gap-5"><div className="card p-6"><div className="flex items-center gap-3 mb-3"><ShieldCheck className="text-blue-700"/><h2 className="text-xl font-bold">Authenticator (TOTP)</h2></div><p className="text-slate-600 text-sm mb-4">Current assurance level: <strong>{aal||'checking'}</strong>. Staff administration requires AAL2.</p>
 {hasFactor?<><p className="text-emerald-700 font-semibold flex items-center gap-2"><CheckCircle2 size={18}/>Authenticator enrolled</p>{aal!=='aal2'&&<Link href="/mfa" className="btn btn-primary mt-4">Verify authenticator</Link>}</>:<>{!enrollment?<button className="btn btn-primary" disabled={busy} onClick={()=>void enroll()}><ShieldPlus size={17}/>Set up authenticator</button>:<form onSubmit={verifyEnrollment} className="max-w-sm space-y-3"><p className="text-sm text-slate-600">Scan the QR code with an authenticator app, or enter the secret manually.</p>{enrollment.qr&&<img className="w-44 h-44 border rounded-lg" alt="Authenticator QR code" src={enrollment.qr.startsWith('data:')?enrollment.qr:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(enrollment.qr)}/>}<p className="text-xs break-all font-mono bg-slate-50 p-3 rounded">{enrollment.secret}</p><label className="label" htmlFor="enroll-code">6-digit code</label><input id="enroll-code" className="input" value={code} onChange={e=>setCode(e.target.value)} inputMode="numeric" pattern="[0-9]{6}" required/><button disabled={busy} className="btn btn-primary">Verify and enable</button></form>}</>}
 </div><form onSubmit={changePassword} className="card p-6"><h2 className="text-xl font-bold mb-2">Change password</h2><p className="text-sm text-slate-600 mb-4">Use a unique password with at least 12 characters.</p><label className="label" htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} className="input max-w-lg" value={password} onChange={e=>setPassword(e.target.value)}/><button disabled={busy||password.length<12} className="btn btn-outline mt-4">Update password</button></form>
 <div className="card p-6"><h2 className="text-xl font-bold mb-2">Sessions</h2><p className="text-sm text-slate-600 mb-4">Revoke refresh tokens for other logged-in sessions while keeping this session active.</p><button className="btn btn-outline" disabled={busy} onClick={()=>void signOutOtherSessions()}><LogOut size={17}/>Sign out other devices</button></div></div></section>;
}
