import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MainWrapper from '@/app/components/MainWrapper';
import HomeMoviesList from '@/app/components/HomeMoviesList';
import fetchMoviesByFilters from '@/app/lib/fetchMoviesByFilters';
import { Movies } from '@/app/types/movie';
import { defaultCategories } from '@/app/lib/fetchMoviesByCategory';
import PaginationComponent from '@/app/components/PaginationComponent';

const ITEMS_PER_PAGE = 20;
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const startFrom = (currentPage - 1) * ITEMS_PER_PAGE;

  const originalCategory = defaultCategories.find(cat => generateSlug(cat.title) === slug);

  if (!originalCategory) {
    notFound();
  }

  const response = await fetchMoviesByFilters(
    startFrom,
    ITEMS_PER_PAGE,
    originalCategory.year,
    originalCategory.genre,
    originalCategory.tag
  );

  const movies = response.data as Movies || [];
  const totalResults = response.total || 0;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  if (movies.length === 0) {
    return (
      <main className="bg-slate-900 text-slate-100 min-h-screen">
        <MainWrapper>
          <div className="pt-20 pb-10 px-4">
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-center">
              {originalCategory.title}
            </h1>
            <p className="text-center text-slate-400 mt-10">
              No movies found for "{originalCategory.title}".
            </p>
          </div>
        </MainWrapper>
      </main>
    );
  }

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen">
      <MainWrapper>
        <div className="pt-20 pb-10 px-4">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-center">
            {originalCategory.title}
          </h1>
          <p className="text-slate-400 text-center mb-10">
            Browse movies in the "{originalCategory.title}" category
          </p>
          <HomeMoviesList
            movies={movies}
            px="px-0"
          />
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/category/${slug}/page`}
              />
            </div>
          )}
        </div>
      </MainWrapper>
    </main>
  );
}
