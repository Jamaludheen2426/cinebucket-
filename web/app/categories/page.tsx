export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import MainWrapper from '@/app/components/MainWrapper';
import { defaultCategories, CategoryConfig } from '@/app/lib/fetchMoviesByCategory';

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

export default function CategoriesIndexPage() {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <MainWrapper>
        <div className="pt-20 pb-10 px-4 md:px-8">
          <h1 className="text-4xl font-extrabold mb-12 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
            Browse Categories
          </h1>
          
          {defaultCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {defaultCategories.map((category: CategoryConfig) => (
                <Link
                  key={category.title}
                  href={`/category/${generateSlug(category.title)}`}
                  className="group bg-slate-800 rounded-xl shadow-lg hover:bg-slate-700/70 transition-all duration-300 ease-in-out transform hover:scale-105 overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-40 sm:h-48"> 
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={`${category.title} category`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-sky-400 mb-2 group-hover:text-sky-300 transition-colors">
                        {category.title}
                      </h2>
                      <p className="text-sm text-slate-400 mb-3">
                        Explore {category.title.toLowerCase()}.
                      </p>
                    </div>
                    <span className="text-xs text-sky-500 group-hover:underline self-start">View Movies &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 mt-10">No categories available at the moment.</p>
          )}
        </div>
      </MainWrapper>
    </div>
  );
}