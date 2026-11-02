'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { UserRoundCog, Bookmark, Compass, FilePlus2, Home, LayoutDashboard, LogIn, LogOut, Menu, PackageSearch, ShieldCheck, X, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';

const links = [
  { href:'/', text:'Home', icon:Home },
  { href:'/browse', text:'Browse', icon:Compass },
  { href:'/report', text:'Report Item', icon:FilePlus2 },
  { href:'/dashboard', text:'Dashboard', icon:LayoutDashboard, signedIn:true },
  { href:'/claims', text:'My Claims', icon:ClipboardCheck, signedIn:true },
];
export function SiteShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { user, role, loading, signOut, configured } = useAuth();
  const { saved } = useSaved();
  const [open, setOpen] = useState(false);
  const navigation = links.filter(link => !link.signedIn || !!user);
  const active = (href:string) => href==='/' ? path==='/' : path.startsWith(href);
  return <div className="min-h-screen flex flex-col">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-site h-[76px] flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={()=>setOpen(false)} aria-label="CampusFind homepage">
          <span className="h-11 w-11 bg-blue-700 text-white rounded-2xl grid place-items-center shadow-sm"><PackageSearch size={24}/></span>
          <span className="leading-tight"><strong className="text-[21px] tracking-tight block">Campus<span className="text-blue-700">Find</span></strong><span className="text-[11px] text-slate-500 font-medium">Lost & Found Portal</span></span>
        </Link>
        <nav className="hidden lg:flex gap-1 items-center" aria-label="Main navigation">{navigation.map(({href,text})=><Link key={href} href={href} className={`navlink ${active(href)?'active':''}`}>{text}</Link>)}{user&&role==='admin'&&<Link href="/admin" className={`navlink ${active('/admin')?'active':''}`}>Admin</Link>}</nav>
        <div className="hidden sm:flex items-center gap-2 ml-auto lg:ml-0">
          <Link href="/browse?saved=1" className="btn btn-icon-light" aria-label={`Saved items: ${saved.length}`} title="Saved items"><Bookmark size={18}/><span className="text-xs font-bold">{saved.length}</span></Link>
          {user&&<Link href="/account/security" className="btn btn-icon-light" title="Account security" aria-label="Account security"><UserRoundCog size={18}/></Link>}
          {!loading && (user ? <button className="btn btn-outline text-sm" onClick={()=>void signOut()}><LogOut size={16}/>Sign out</button> : <Link href="/login" className="btn btn-primary text-sm"><LogIn size={16}/>Sign in</Link>)}
        </div>
        <button type="button" className="lg:hidden btn btn-icon-light" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
      </div>
      {open && <nav className="lg:hidden px-4 pb-4 pt-1 border-t bg-white grid gap-1" aria-label="Mobile navigation">{navigation.map(({href,text,icon:Icon})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={`mobile-link ${active(href)?'active':''}`}><Icon size={17}/>{text}</Link>)}<Link href="/browse?saved=1" className="mobile-link" onClick={()=>setOpen(false)}><Bookmark size={17}/>Saved items ({saved.length})</Link>{user&&role==='admin'&&<Link className="mobile-link" href="/admin" onClick={()=>setOpen(false)}><ShieldCheck size={17}/>Admin</Link>}{user&&<Link className="mobile-link" href="/account/security" onClick={()=>setOpen(false)}><UserRoundCog size={17}/>Account security</Link>}{user?<button onClick={()=>{void signOut();setOpen(false)}} className="mobile-link"><LogOut size={17}/>Sign out</button>:<Link href="/login" className="mobile-link" onClick={()=>setOpen(false)}><LogIn size={17}/>Sign in</Link>}</nav>}
    </header>
    {!configured && <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm"><div className="container-site py-3"><strong>Setup required:</strong> Supabase configuration is missing. Add the URL and public key in Vercel Environment Variables (or a local .env.local file), then redeploy.</div></div>}
    <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
    <footer className="bg-[#0e2340] text-blue-100 mt-16"><div className="container-site py-10 grid sm:grid-cols-3 gap-8"><div><div className="font-bold text-white text-xl mb-2">CampusFind</div><p className="text-blue-200/80 text-sm leading-6">A more organized way to report, find and return belongings on campus.</p></div><div><h3 className="font-semibold text-white mb-3">Quick access</h3><div className="flex flex-col gap-2 text-sm"><Link href="/browse">Browse reports</Link><Link href="/report">Report an item</Link><Link href="/dashboard">My dashboard</Link></div></div><div><h3 className="font-semibold text-white mb-3">About the project</h3><p className="text-blue-200/80 text-sm leading-6">Design Engineering · Campus Lost and Found Portal<br/>Enrollment No. 221173107008</p></div></div><div className="border-t border-white/10"><div className="container-site py-4 text-xs text-blue-200/70 flex justify-between flex-wrap gap-2"><span>Academic project prototype</span><button type="button" className="underline hover:text-white" onClick={()=>window.dispatchEvent(new Event('campusfind-consent-open'))}>Privacy preferences</button><span>Claims are verified by authorized staff</span></div></div></footer>
  </div>;
}
