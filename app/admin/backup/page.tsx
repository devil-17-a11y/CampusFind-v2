'use client';
import { useState } from 'react';
import { DatabaseBackup, Download, ShieldAlert } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
type BackupTable='profiles'|'items'|'claims'|'status_history'|'admin_logs'|'portal_settings';
const tables:BackupTable[]=['profiles','items','claims','status_history','admin_logs','portal_settings'];
export default function BackupPage(){const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function exportData(){const db=getSupabase();if(!db)return;setBusy(true);setMessage('');try{
  const payload:Record<string,unknown>={format:'campusfind-admin-data-v1',exported_at:new Date().toISOString(),note:'JSON export only. Auth users and storage files are NOT included.'};
  for(const table of tables){const rows:unknown[]=[];for(let from=0;from<100000;from+=500){
    const {data,error}=await db.from(table).select('*').range(from,from+499);if(error)throw new Error(`${table}: ${error.message}`);
    rows.push(...(data||[]));if((data||[]).length<500)break;
  }payload[table]=rows;}
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`campusfind-admin-export-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
  setMessage('Export complete. Keep this file in secure storage: it may contain private ownership evidence.');
 }catch(e){setMessage(e instanceof Error?e.message:'Export failed');}finally{setBusy(false)}}
 return <div><h1 className="text-3xl font-extrabold">Data backups</h1><p className="text-slate-500 mt-2 mb-6">Export application data and plan a safe, restorable database backup.</p>
 <div className="card p-6 mb-5"><DatabaseBackup size={30} className="text-blue-700"/><h2 className="text-xl font-bold mt-3">Download admin data export</h2><p className="text-slate-600 text-sm my-3">Exports the records your authenticated staff account is permitted to read, including item reports, claims, settings and audit logs. Saves a JSON file on your device.</p><button disabled={busy} className="btn btn-primary" onClick={()=>void exportData()}><Download size={17}/>{busy?'Preparing export…':'Download JSON export'}</button>{message&&<p className="text-sm mt-3" role="status">{message}</p>}</div>
 <div className="card p-6"><ShieldAlert className="text-amber-600"/><h2 className="text-lg font-bold mt-3">Complete backup and restore</h2><p className="text-slate-600 text-sm my-3">A complete recovery must include PostgreSQL data, Supabase Auth users and Storage files. This browser export is not a fully restorable database snapshot. Use managed backups or an authorized database dump before upgrades. Restore through Supabase infrastructure, not from a public web form.</p><a href="https://supabase.com/docs/guides/platform/backups" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold text-sm">Supabase backup documentation</a></div></div>;
}
