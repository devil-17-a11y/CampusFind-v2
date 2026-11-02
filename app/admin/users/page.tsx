'use client';
import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';

type ManagedUser = {id:string;email:string;full_name:string;role:'student'|'admin'};
export default function UserRoleManagement(){
 const {user,role,loading} = useAuth();
 const [users,setUsers]=useState<ManagedUser[]>([]);
 const [pending,setPending]=useState<string|null>(null);
 const [loadingList,setLoadingList]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const load=useCallback(async()=>{
   if(!user||role!=='super_admin') return;
   const db=getSupabase();if(!db) return;
   setLoadingList(true);setError('');
   const {data,error}=await db.rpc('list_manageable_users');
   setLoadingList(false);
   if(error){setError(error.message);return;}
   setUsers((data||[]) as ManagedUser[]);
 },[user,role]);
 useEffect(()=>{void load()},[load]);
 const changeRole=async (member:ManagedUser)=>{
   const next=member.role==='admin'?'student':'admin';
   if(!window.confirm(`Change ${member.email} from ${member.role} to ${next}?`))return;
   const db=getSupabase();if(!db)return;
   setPending(member.id);setError('');setNotice('');
   const {error}=await db.rpc('set_managed_user_role',{p_user_id:member.id,p_new_role:next});
   if(error)setError(error.message);
   else{setNotice(`Updated ${member.email} to ${next}.`);await load();}
   setPending(null);
 };
 if(loading)return <div className="py-10">Checking administrator access…</div>;
 if(!user||role!=='super_admin')return <div className="card p-8"><h1 className="text-xl font-bold">Super Admin access required</h1><p className="mt-2 text-slate-600">Only a verified Super Admin can manage user roles.</p></div>;
 return <section className="py-2">
   <div className="flex gap-3 flex-wrap justify-between items-center mb-6">
     <div><p className="text-xs tracking-widest uppercase text-blue-700 font-bold">Super Admin</p><h1 className="text-3xl font-extrabold mt-1">User role management</h1><p className="text-slate-600 mt-2">Promote students to admin or return administrators to student access. All changes are audited.</p></div>
     <button type="button" className="btn btn-outline" onClick={()=>void load()} disabled={loadingList}><RefreshCw size={16}/>Refresh</button>
   </div>
   <div className="card p-5 flex gap-3 items-start mb-6"><ShieldCheck className="text-blue-700 shrink-0"/><p className="text-sm text-slate-600">This screen requires verified two-factor authentication. Only the Supabase SQL Editor can assign or revoke the Super Admin role.</p></div>
   {error&&<p role="alert" className="bg-rose-50 text-rose-700 p-4 rounded-lg mb-4">{error}</p>}
   {notice&&<p role="status" className="bg-emerald-50 text-emerald-800 p-4 rounded-lg mb-4">{notice}</p>}
   <div className="card overflow-x-auto">
     <table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Action</th></tr></thead>
       <tbody>{users.map(member=><tr key={member.id} className="border-t border-slate-100">
         <td className="p-4"><div className="font-semibold">{member.full_name||'Unnamed account'}</div><div className="text-slate-500 break-all">{member.email}</div></td>
         <td className="p-4 capitalize">{member.role}</td>
         <td className="p-4"><button type="button" className="btn btn-outline" onClick={()=>void changeRole(member)} disabled={!!pending}><UserCog size={16}/>{pending===member.id?'Updating…':member.role==='admin'?'Change to student':'Make admin'}</button></td>
       </tr>)}</tbody>
     </table>
     {loadingList&&<div className="p-5 text-slate-500">Loading accounts…</div>}
     {!loadingList&&!error&&users.length===0&&<div className="p-5 text-slate-500">No student or admin accounts found.</div>}
   </div>
 </section>;
}
