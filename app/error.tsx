'use client';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  useEffect(()=>{console.error('CampusFind page error:',error);},[error]);
  return <section className="container-site py-24 text-center"><AlertTriangle size={48} className="text-amber-600 mx-auto mb-5"/><h1 className="heading-xl">Something went wrong</h1><p className="text-slate-500 mt-3">The page could not be displayed. Please try again or check the setup guide if the problem continues.</p><button className="btn btn-primary mt-7" onClick={reset}><RotateCcw size={16}/>Try again</button></section>;
}
