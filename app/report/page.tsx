'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Info, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { categories, locations, getSupabase, localDate, type ItemType } from '@/lib/supabase';
import { Alert, PageHeading, RequireAuth } from '@/components/ui/Primitives';
const db = getSupabase();
export default function ReportPage(){
  const {user,loading:authLoading}=useAuth();const router=useRouter();
  const [type,setType]=useState<ItemType>('lost');
  const [title,setTitle]=useState('');const [category,setCategory]=useState(categories[0]);
  const [location,setLocation]=useState(locations[0]);const [date,setDate]=useState(localDate());
  const [description,setDescription]=useState('');const [photo,setPhoto]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  if(authLoading)return <section className="container-site py-16">Checking account…</section>;
  if(!user)return <RequireAuth/>;
  async function submit(e:FormEvent){e.preventDefault();if(!db||!user)return;setBusy(true);setError('');let imagePath:string|null=null;
    try{
      if(title.trim().length<2)throw new Error('Please enter a more descriptive item title.');
      if(description.trim().length<5)throw new Error('Please provide a description of at least 5 characters.');
      if(date>localDate())throw new Error('The incident date cannot be in the future.');
      if(photo){if(photo.size>5*1024*1024)throw new Error('Images must be 5 MB or smaller.');if(!['image/jpeg','image/png','image/webp'].includes(photo.type))throw new Error('Choose a JPEG, PNG, or WebP image.');
        const ext=photo.type==='image/png'?'png':photo.type==='image/webp'?'webp':'jpg';imagePath=`${user.id}/${crypto.randomUUID()}.${ext}`;
        const {error:uploadError}=await db.storage.from('item-images').upload(imagePath,photo,{contentType:photo.type,upsert:false});if(uploadError)throw uploadError;
      }
      const {error:insertError}=await db.from('items').insert({user_id:user.id,title:title.trim(),item_type:type,category,location,incident_date:date,description:description.trim(),image_path:imagePath,status:type});
      if(insertError)throw insertError;
      router.push('/dashboard?created=1');router.refresh();
    }catch(e){if(imagePath)await db.storage.from('item-images').remove([imagePath]);setError(e instanceof Error?e.message:'Unable to submit your report.');}
    finally{setBusy(false);}
  }
  return <section className="container-site max-w-4xl py-12 sm:py-16"><PageHeading eyebrow="Help the campus community" title="Report an item" subtitle="Provide the details you know so others can recognize the item."/>
    <div className="card p-5 sm:p-8"><div className="grid grid-cols-2 gap-3 mb-8"><button type="button" aria-pressed={type==='lost'} onClick={()=>setType('lost')} className={`btn py-4 ${type==='lost'?'btn-primary':'btn-outline'}`}>I lost something</button><button type="button" aria-pressed={type==='found'} onClick={()=>setType('found')} className={`btn py-4 ${type==='found'?'btn-primary':'btn-outline'}`}>I found something</button></div>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2"><label className="label" htmlFor="title">Item title *</label><input id="title" className="input" required minLength={2} maxLength={150} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Black wireless earphones"/></div>
        <div><label htmlFor="category" className="label">Category *</label><select className="input" id="category" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="location" className="label">Campus location *</label><select className="input" id="location" value={location} onChange={e=>setLocation(e.target.value)}>{locations.map(l=><option key={l}>{l}</option>)}</select></div>
        <div><label className="label" htmlFor="incident-date">Date {type==='lost'?'lost':'found'} *</label><input type="date" className="input" id="incident-date" value={date} onChange={e=>setDate(e.target.value)} max={localDate()} required/></div>
        <div><label className="label" htmlFor="image">Photo (optional)</label><label htmlFor="image" className="flex gap-3 items-center border border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-3 cursor-pointer min-h-[48px]"><Camera size={19} className="text-blue-600"/><span className="text-sm text-slate-600 truncate">{photo?photo.name:'Choose a photo · max 5 MB'}</span></label><input id="image" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]??null)}/></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="description">Item description *</label><textarea id="description" className="input min-h-36" required minLength={5} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe its appearance and where you last saw or found it. Do not include private identifying details."/><div className="text-right text-xs text-slate-400 mt-1">{description.length}/2000</div></div>
        <div className="sm:col-span-2 flex gap-3 bg-amber-50 rounded-xl p-4 text-amber-900 text-sm"><Info size={20} className="shrink-0"/><p>Reports and photos are publicly visible. Never include complete student ID numbers, personal contact details, passwords, financial information or ownership secrets. Share identifying proof only through the private claim form.</p></div>
        <div className="sm:col-span-2"><Alert message={error}/><div className="flex justify-end items-center gap-3 flex-wrap"><Link className="btn btn-outline" href="/dashboard">Cancel</Link><button type="submit" disabled={busy} className="btn btn-primary min-w-44"><Upload size={17}/>{busy?'Submitting…':'Publish report'}</button></div></div>
      </form>
    </div>
  </section>;
}
