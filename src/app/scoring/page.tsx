'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ScoringPage(){
  const router=useRouter();
  useEffect(()=>{router.replace('/discover');},[router]);
  return<div className="glass p-12 text-center text-text-muted"><div className="text-3xl animate-pulse">🎯</div><div className="mt-3">Redirecting to Company Discover…</div></div>;
}
