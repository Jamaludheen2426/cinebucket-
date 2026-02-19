export const dynamic = 'force-dynamic';
import React from 'react';
import MainWrapper from '@/app/components/MainWrapper';

export default function KidsPage() {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <MainWrapper>
        <div className="pt-20 pb-10 text-center">
          <h1 className="text-3xl font-bold mb-10 px-4">Kids Zone</h1>
          <p className="text-slate-400">This page is under construction. Content for kids will appear here soon!</p>
        </div>
      </MainWrapper>
    </div>
  );
}