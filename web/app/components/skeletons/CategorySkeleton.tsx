import React from 'react';

const MovieCardSkeleton = () => (
  <div className="flex-shrink-0 w-[180px]">
    <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-slate-700 animate-pulse"></div>
    <div className="mt-2 h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
    <div className="mt-1 h-3 bg-slate-700 rounded w-1/2 animate-pulse"></div>
  </div>
);

const SectionSkeleton = ({ title }: { title: string }) => (
  <div className="mb-12">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-slate-500 h-6 bg-slate-700 rounded w-1/4 animate-pulse">{/* title */}</h2>
    </div>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

export const CategoriesPageSkeleton = () => {
  const mockCategories = [
    { title: "Loading Category 1" },
    { title: "Loading Category 2" },
    { title: "Loading Category 3" },
  ];
  return (
    <div className="pt-20 pb-10">
      <h1 className="text-3xl font-bold mb-10 px-4 text-center h-8 bg-slate-700 rounded w-1/3 mx-auto animate-pulse"></h1>
      {mockCategories.map((category) => (
        <SectionSkeleton key={category.title} title={category.title} />
      ))}
    </div>
  );
};

export default CategoriesPageSkeleton;