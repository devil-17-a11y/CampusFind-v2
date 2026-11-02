'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Save, ExternalLink } from 'lucide-react';
type Settings={project_name:string;ga4_measurement_id:string;gsc_property_url:string;consent_notice:string};
const defaults:Settings={project_name:'CampusFind',ga4_measurement_id:'',gsc_property_url:'',consent_notice:'Allow anonymous page-view analytics to improve this campus portal?'};
export default function SettingsPage(){
  const [form,setForm]=useState(defaults);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
  useEffect(()=>{getSupabase()?.from('portal_settings').select('project_name,ga4_measurement_id,gsc_property_url,consent_notice').eq('singleton',true).maybeSingle().then(({data,error})=>{if(data)setForm(data as Settings);if(error)setError(error.message)})},[]);
  async function submit(e:FormEvent){e.preventDefault();setError('');setSuccess('');if(form.ga4_measurement_id&&!/^G-[A-Z0-9]{4,20}$/.test(form.ga4_measurement_id)){setError('GA4 ID must look like G-XXXXXXXX.');return;}
    if(form.gsc_property_url&&!/^(https?:\/\/|sc-domain:)/.test(form.gsc_property_url)){setError('Enter a URL-prefix or sc-domain: property.');return;}
    const db=getSupabase();if(!db)return;setBusy(true);const {error}=await db.from('portal_settings').update({...form,updated_at:new Date().toISOString()}).eq('singleton',true);setBusy(false);if(error)setError(error.message);else setSuccess('Settings saved. Reload public pages to apply GA4 changes.');}
  return <div><h1 className="text-3xl font-extrabold">Analytics settings</h1><p className="text-slate-500 mt-2 mb-6">Connect your existing GA4 property and record the Google Search Console property for manual access. Never enter API secrets here.</p>
  <form className="card p-6 space-y-5" onSubmit={submit}>
  <div><label className="label" htmlFor="project-name">Project name</label><input id="project-name" className="input" maxLength={80} value={form.project_name} onChange={e=>setForm({...form,project_name:e.target.value})}/></div>
  <div><label className="label" htmlFor="ga4">GA4 measurement ID (optional)</label><input id="ga4" className="input" placeholder="G-XXXXXXXXXX" value={form.ga4_measurement_id} onChange={e=>setForm({...form,ga4_measurement_id:e.target.value.trim().toUpperCase()})}/><p className="text-xs text-slate-500 mt-2">Loads GA4 only after analytics consent. Site administrator must configure the GA4 property.</p></div>
  <div><label className="label" htmlFor="gsc">Google Search Console property (optional)</label><input id="gsc" className="input" placeholder="https://your-site.vercel.app/ or sc-domain:example.com" value={form.gsc_property_url} onChange={e=>setForm({...form,gsc_property_url:e.target.value.trim()})}/><p className="text-xs text-slate-500 mt-2">This field is a reference link, not a Google Search Console API integration.</p></div>
  <div><label className="label" htmlFor="consent">Privacy notice</label><textarea id="consent" className="input" rows={3} maxLength={500} value={form.consent_notice} onChange={e=>setForm({...form,consent_notice:e.target.value})}/><p className="text-xs text-slate-500 mt-2">Optional configuration field. The built-in consent notice uses standardized language.</p></div>
  {error&&<p className="p-3 rounded bg-rose-50 text-rose-700" role="alert">{error}</p>}{success&&<p className="p-3 rounded bg-emerald-50 text-emerald-700" role="status">{success}</p>}
  <button disabled={busy} className="btn btn-primary"><Save size={17}/>{busy?'Saving…':'Save settings'}</button></form>
  <div className="card p-6 mt-5"><h2 className="text-lg font-bold mb-3">Open reporting platforms</h2><div className="flex flex-wrap gap-3"><a className="btn btn-outline" href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">Open GA4 <ExternalLink size={15}/></a><a className="btn btn-outline" href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Open Search Console <ExternalLink size={15}/></a></div><p className="text-xs text-slate-500 mt-3">GA4 and GSC data are not imported into the local traffic dashboard.</p></div></div>;
}
