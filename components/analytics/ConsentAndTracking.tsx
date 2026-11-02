'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type Consent = 'accepted'|'rejected'|null;
const CONSENT_KEY='campusfind-analytics-consent-v1';
const VISITOR_KEY='campusfind-anon-visitor-v1';
let initializedGoogle='';
function privacySafePage(path:string){return !/^\/(admin|dashboard|claims|login|signup|forgot-password|reset-password|account|mfa)(\/|$)/.test(path)}
function enableGA4(id:string){
  if(typeof window==='undefined'||initializedGoogle===id||!/^G-[A-Z0-9]{4,20}$/.test(id))return;
  initializedGoogle=id;
  const w=window as Window&{dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
  w.dataLayer=w.dataLayer||[];
  w.gtag=(...args:unknown[])=>{w.dataLayer?.push(args)};
  w.gtag('js',new Date());w.gtag('config',id,{send_page_view:false,anonymize_ip:true});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script);
}
export function ConsentAndTracking(){
  const pathname=usePathname();
  const [consent,setConsent]=useState<Consent>(null);
  const [ready,setReady]=useState(false);
  const [open,setOpen]=useState(false);
  const [ga4,setGa4]=useState('');
  const [notice,setNotice]=useState('Allow anonymous page-view analytics to improve this campus portal?');
  const lastLoggedPath=useRef('');
  const lastGooglePath=useRef('');
  useEffect(()=>{
    const previous=localStorage.getItem(CONSENT_KEY);
    if(previous==='accepted'||previous==='rejected')setConsent(previous);
    else setOpen(true);
    setReady(true);
    const show=()=>setOpen(true);
    window.addEventListener('campusfind-consent-open',show);
    const db=getSupabase();if(db)void db.from('portal_settings').select('ga4_measurement_id,consent_notice').eq('singleton',true).maybeSingle().then(({data})=>{setGa4(data?.ga4_measurement_id||'');if(data?.consent_notice)setNotice(data.consent_notice)});
    return()=>window.removeEventListener('campusfind-consent-open',show);
  },[]);
  useEffect(()=>{
    if(!ready||consent!=='accepted'||!privacySafePage(pathname))return;
    if(ga4){enableGA4(ga4);const w=window as Window&{gtag?:(...args:unknown[])=>void};if(lastGooglePath.current!==pathname){w.gtag?.('event','page_view',{page_path:pathname,page_title:document.title});lastGooglePath.current=pathname}}
    const db=getSupabase();if(!db||lastLoggedPath.current===pathname)return;lastLoggedPath.current=pathname;
    let key=localStorage.getItem(VISITOR_KEY);
    if(!key){key=crypto.randomUUID();localStorage.setItem(VISITOR_KEY,key)}
    const q=new URLSearchParams(window.location.search);
    const source=q.get('utm_source')||new URL(document.referrer||window.location.href).hostname||'direct';
    const medium=q.get('utm_medium')||(q.has('utm_source')?'campaign':'referral');
    const campaign=q.get('utm_campaign')||'';
    const screen=Math.min(window.innerWidth,window.screen.width);
    void db.rpc('record_portal_view',{
      p_visitor_key:key,p_page_path:pathname,
      p_source:source,p_medium:medium,p_campaign:campaign,
      p_referrer_host:document.referrer?new URL(document.referrer).hostname:'',
      p_device:screen<640?'mobile':screen<1024?'tablet':'desktop',
    });
  },[pathname,consent,ga4,ready]);
  function choose(value:Exclude<Consent,null>){localStorage.setItem(CONSENT_KEY,value);setConsent(value);setOpen(false)}
  if(!ready||!open)return null;
  return <div role="dialog" aria-label="Privacy preferences" className="fixed z-50 bottom-4 left-4 right-4 mx-auto max-w-xl card p-5 shadow-2xl border-blue-200"><h2 className="text-lg font-extrabold">Your privacy, your choice</h2><p className="text-sm text-slate-600 mt-2">{notice} Optional analytics measure page visits, referring sources and device category. No names, emails, item searches or ownership proofs are collected. Rejecting does not affect portal access.</p><div className="flex flex-wrap gap-2 mt-4"><button className="btn btn-primary" onClick={()=>choose('accepted')}>Allow analytics</button><button className="btn btn-outline" onClick={()=>choose('rejected')}>Reject optional analytics</button></div></div>;
}
