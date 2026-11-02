'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, CalendarDays, CheckCircle2, MapPin, PackageSearch, ShieldCheck } from 'lucide-react';
import { getSupabase, formatDate, imageUrl, suggestMatches, type Item } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';
import { useItems } from '@/hooks/useItems';
import { Alert, StatusBadge } from '@/components/ui/Primitives';
export default function ItemDetailsPage(){
  const {id}=useParams<{id:string}>();const router=useRouter();const {user}=useAuth();const {has,toggle}=useSaved();
  const {items}=useItems();const [item,setItem]=useState<Item|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [proof,setProof]=useState('');const [sending,setSending]=useState(false);const [success,setSuccess]=useState('');
  useEffect(()=>{const db=getSupabase();if(!db){setLoading(false);return;}let live=true;db.from('items').select('*').eq('id',id).single().then(({data,error})=>{if(!live)return;setItem(data as Item|null);if(error)setError('This item could not be loaded.');setLoading(false)});return()=>{live=false;};},[id]);
  const candidateMatches=item?suggestMatches(item,items):[];
  async function submitClaim(e:FormEvent){e.preventDefault();const db=getSupabase();if(!db||!item||!user)return;
    if(proof.trim().length<15){setError('Please describe identifying details with at least 15 characters.');return;}
    setSending(true);setError('');const {error}=await db.from('claims').insert({item_id:item.id,claimant_id:user.id,proof_description:proof.trim()});
    setSending(false);if(error)setError(error.code==='23505'?'You have already claimed this item.':error.message);else{setSuccess('Claim submitted for staff verification.');setProof('');router.push('/claims');}
  }
  if(loading)return <section className="container-site py-16">Loading item details…</section>;
  if(!item)return <section className="container-site py-16"><Alert message={error||'Item not found.'}/><Link href="/browse" className="btn btn-outline mt-4">Back to browse</Link></section>;
  const photo=imageUrl(item.image_path);const claimAllowed=item.item_type==='found'&&!['returned','closed'].includes(item.status)&&item.user_id!==user?.id;
  return <section className="container-site py-10 sm:py-14"><Link href="/browse" className="inline-flex gap-2 text-sm font-bold text-blue-700 items-center mb-7"><ArrowLeft size={16}/> All items</Link>
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8"><div className="rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden min-h-80 flex items-center justify-center">{photo?<img className="w-full h-full max-h-[480px] object-cover" src={photo} alt={`Photo of ${item.title}`}/>:<PackageSearch size={74} className="text-blue-200"/>}</div>
    <div className="card p-6 md:p-8"><div className="flex flex-wrap gap-2 mb-4"><StatusBadge status={item.status}/><span className="pill">{item.category}</span><span className="pill">{item.item_type} report</span></div><h1 className="heading-xl">{item.title}</h1><p className="text-slate-600 leading-7 mt-5 whitespace-pre-wrap">{item.description}</p><div className="border-t border-slate-100 mt-6 pt-5 space-y-3 text-sm"><div className="flex gap-3 items-center"><MapPin size={18} className="text-blue-700"/><strong>Location:</strong>{item.location}</div><div className="flex gap-3 items-center"><CalendarDays size={18} className="text-blue-700"/><strong>Date:</strong>{formatDate(item.incident_date)}</div></div>
      <button type="button" onClick={()=>toggle(item.id)} className="btn btn-soft mt-6"><Bookmark size={17} fill={has(item.id)?'currentColor':'none'}/>{has(item.id)?'Remove bookmark':'Save this item'}</button>
      {item.status==='returned'&&<div className="notice notice-success"><CheckCircle2 size={18}/> This item has been marked as returned.</div>}
    </div></div>
    <div className="grid lg:grid-cols-2 gap-8 mt-8"><div className="card p-6 md:p-8"><div className="flex items-center gap-3"><ShieldCheck className="text-blue-700"/><h2 className="text-xl font-extrabold">Ownership claim</h2></div><p className="text-slate-500 text-sm leading-6 mt-3">Claims are private and reviewed by authorized campus staff. Do not enter passwords or financial information.</p>
      {claimAllowed ? user ? <form className="mt-5" onSubmit={submitClaim}><label className="label" htmlFor="proof">Private identifying details *</label><textarea id="proof" className="input min-h-32" required minLength={15} maxLength={1000} value={proof} onChange={e=>setProof(e.target.value)} placeholder="Describe identifying marks or other details that only the owner could know."/><Alert message={error}/><Alert variant="success" message={success}/><button className="btn btn-primary mt-4 w-full" disabled={sending}>{sending?'Submitting…':'Submit claim'}</button></form> : <Link className="btn btn-primary mt-5" href="/login">Sign in to claim</Link> : <p className="text-sm text-slate-500 font-semibold mt-5">Claims are not available for this report.</p>}
    </div><div className="card p-6 md:p-8"><h2 className="text-xl font-extrabold">Possible related reports</h2><p className="text-sm text-slate-500 mt-2 leading-6">Suggestions use category, location and title similarities. They are not proof of ownership.</p><div className="mt-5 space-y-3">{candidateMatches.length?candidateMatches.map(({item:match,score})=><Link href={`/items/${match.id}`} key={match.id} className="block border border-slate-200 rounded-xl p-4 hover:bg-blue-50"><div className="font-bold">{match.title}</div><div className="text-sm text-slate-500 mt-1">{match.location} · {score}% similarity</div></Link>):<p className="text-sm text-slate-500">No related reports detected at this time.</p>}</div></div></div>
  </section>;
}
