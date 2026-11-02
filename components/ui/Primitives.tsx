import Link from 'next/link';
import { AlertCircle, ArrowRight, PackageOpen, ShieldAlert } from 'lucide-react';
import { type ItemStatus } from '@/lib/supabase';

export function StatusBadge({ status }: { status: ItemStatus | 'pending' | 'approved' | 'rejected' }) {
  const classes = status === 'returned' || status === 'approved' ? 'status-good' :
    status === 'lost' || status === 'rejected' ? 'status-red' : 'status-amber';
  return <span className={`status ${classes}`}>{status.replaceAll('_', ' ')}</span>;
}
export function Alert({ message, variant='error' }: { message: string; variant?: 'error' | 'success' }) {
  if (!message) return null;
  return <div role={variant === 'error' ? 'alert' : 'status'} className={`notice ${variant === 'success' ? 'notice-success' : 'notice-error'}`}><AlertCircle size={18} className="shrink-0"/>{message}</div>;
}
export function EmptyState({ title, description, action, href }: { title: string; description: string; action?: string; href?: string }) {
  return <div className="card text-center px-6 py-14"><PackageOpen size={42} className="mx-auto text-slate-300 mb-4"/><h3 className="text-lg font-bold">{title}</h3><p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">{description}</p>{action && href && <Link className="btn btn-primary mt-5" href={href}>{action}<ArrowRight size={16}/></Link>}</div>;
}
export function RequireAuth({ admin=false }: { admin?: boolean }) {
  return <div className="max-w-lg mx-auto text-center card p-10 my-16"><ShieldAlert size={40} className="text-blue-700 mx-auto mb-3"/><h2 className="text-2xl font-bold">{admin?'Admin access required':'Sign in required'}</h2><p className="text-slate-500 my-3">{admin?'This area is restricted to authorized campus staff.':'Please sign in to use this feature.'}</p><Link className="btn btn-primary mt-3" href="/login">Go to login<ArrowRight size={16}/></Link></div>;
}
export function PageHeading({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"><div>{eyebrow&&<p className="eyebrow mb-2">{eyebrow}</p>}<h1 className="heading-xl">{title}</h1>{subtitle&&<p className="text-slate-500 mt-2 max-w-2xl">{subtitle}</p>}</div>{children}</div>;
}
