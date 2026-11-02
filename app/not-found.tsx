import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
export default function NotFound(){return <section className="container-site py-24 text-center"><SearchX size={54} className="text-blue-300 mx-auto mb-6"/><p className="eyebrow">Page not found</p><h1 className="heading-xl mt-3">That page isn't here</h1><p className="text-slate-500 mt-3">The link may be outdated or the page may have moved.</p><Link href="/" className="btn btn-primary mt-7"><ArrowLeft size={16}/>Back home</Link></section>}
