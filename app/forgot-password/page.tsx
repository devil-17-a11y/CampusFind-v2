'use client';
import Link from 'next/link';
import { useState,type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { AuthFrame } from '@/components/auth/AuthFrame';
import { Alert } from '@/components/ui/Primitives';
export default function ForgotPage(){const [email,setEmail]=useState('');const [error,setError]=useState('');const [done,setDone]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db){setError('Supabase settings are missing.');return;}setBusy(true);setError('');setDone('');const {error}=await db.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});setBusy(false);if(error)setError(error.message);else setDone('If this email is registered, you will receive a password reset link. Check your inbox and spam folder.');}
  return <AuthFrame title="Reset your password" subtitle="Enter your account email and we’ll send you a secure recovery link."><form className="space-y-5" onSubmit={submit}><div><label className="label" htmlFor="recovery-email">Registered email</label><input id="recovery-email" type="email" className="input" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@college.edu"/></div><Alert message={error}/><Alert message={done} variant="success"/><button className="btn btn-primary w-full" disabled={busy}>{busy?'Sending…':'Send reset link'}</button></form><p className="text-sm text-center mt-5"><Link className="text-blue-700 font-bold" href="/login">Return to login</Link></p></AuthFrame>;
}
