import React from 'react';
import MainWrapper from '../MainWrapper';

const MovieCardSkeleton = () => (
  <div className="w-full">
    <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-slate-700 animate-pulse"></div>
    <div className="mt-2 h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
    <div className="mt-1 h-3 bg-slate-700 rounded w-1/2 animate-pulse"></div>
  </div>
);

export const SingleCategoryPageSkeleton = ({ itemCount = 10 }: { itemCount?: number }) => {
  return (
    <MainWrapper>
      <div className="pt-20 pb-10">
        <div className="px-4">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2 animate-pulse"></div> 
          <div className="h-5 bg-slate-700 rounded w-1/2 mb-8 animate-pulse"></div> 
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {Array.from({ length: itemCount }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </MainWrapper>
  );
};

export default SingleCategoryPageSkeleton;