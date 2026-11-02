import Link from 'next/link';
import { LockKeyhole, PackageSearch } from 'lucide-react';
import type { ReactNode } from 'react';
export function AuthFrame({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}){
  return <section className="container-site py-12 sm:py-20"><div className="max-w-md mx-auto card p-6 sm:p-9"><div className="text-center mb-7"><div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center mx-auto mb-5"><LockKeyhole size={25}/></div><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1><p className="text-slate-500 text-sm mt-3 leading-6">{subtitle}</p></div>{children}<div className="mt-7 pt-6 border-t text-center text-xs text-slate-400"><Link href="/" className="inline-flex items-center gap-2 hover:text-blue-700"><PackageSearch size={15}/>Back to CampusFind</Link></div></div></section>;
}
