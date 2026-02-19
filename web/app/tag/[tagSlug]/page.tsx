import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MainWrapper from '@/app/components/MainWrapper';
import HomeMoviesList from '@/app/components/HomeMoviesList';
import { fetchMoviesByFiltersForCategory } from '@/app/lib/fetchMoviesServer';
import { Movies } from '@/app/types/movie';
import SingleCategoryPageSkeleton from '@/app/components/skeletons/SingleCategoryPageSkeleton'; // Re-use skeleton
import PaginationComponent from '@/app/components/PaginationComponent';

const ITEMS_PER_PAGE = 20;

const deSlugifyTag = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function TagMoviesList({ tagSlug, currentPage }: { tagSlug: string, currentPage: number }) {
  const tagNameForFilter = deSlugifyTag(tagSlug);
  const startFrom = (currentPage - 1) * ITEMS_PER_PAGE;

  const response = await fetchMoviesByFiltersForCategory(
    startFrom,
    ITEMS_PER_PAGE,
    undefined,
    undefined,
    tagNameForFilter
  );

  const movies = response.data as Movies || [];
  const totalResultsInBatch = response.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalResultsInBatch / ITEMS_PER_PAGE));

  if (movies.length === 0 && currentPage === 1) {
    return <p className="text-center text-slate-400 mt-10">No movies found for tag "{tagNameForFilter}".</p>;
  }

  return (
    <>
      <HomeMoviesList
        movies={movies}
        px="px-0"
      />
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/tag/${tagSlug}`}
          />
        </div>
      )}
    </>
  );
}

export default async function DynamicTagPage(props: any) {
  const { params, searchParams } = props;
  const { tagSlug } = params;
  if (!tagSlug) {
    notFound();
  }

  const displayTagName = deSlugifyTag(tagSlug);
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <MainWrapper>
        <div className="pt-20 pb-10 px-4">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-center">
            Movies tagged: {displayTagName}
          </h1>
          <p className="text-slate-400 text-center mb-10">
            Browse movies tagged with "{displayTagName}".
          </p>
          <Suspense fallback={<SingleCategoryPageSkeleton itemCount={ITEMS_PER_PAGE} />}>
            <TagMoviesList tagSlug={tagSlug} currentPage={currentPage} />
          </Suspense>
        </div>
      </MainWrapper>
    </div>
  );
}