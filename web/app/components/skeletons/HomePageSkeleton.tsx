import React from 'react';
import MainWrapper from '../MainWrapper'; 

const MovieCardSkeleton = () => (
  <div className="flex-shrink-0 w-[180px]">
    <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-slate-700 animate-pulse"></div>
    <div className="mt-2 h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
    <div className="mt-1 h-3 bg-slate-700 rounded w-1/2 animate-pulse"></div>
  </div>
);

const SectionSkeleton = ({ hasTitle = true }: { hasTitle?: boolean }) => (
  <div className="mb-12">
    {hasTitle && <div className="h-7 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>}
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

export const HomePageSkeleton = () => {
  return (
    <MainWrapper>
      <div className="h-64 md:h-96 bg-slate-700 rounded-lg mb-12 animate-pulse"></div>
      
      <div className="mb-12">
        <div className="relative w-full max-w-3xl mx-auto">
          <div className="h-12 bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <SectionSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </MainWrapper>
  );
};

export default HomePageSkeleton;