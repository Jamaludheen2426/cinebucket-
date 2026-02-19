import { notFound } from "next/navigation";
import { fetchMoviesByFiltersForCategory } from '@/app/lib/fetchMoviesServer';
import HomeMoviesList from "@/app/components/HomeMoviesList";
import MainWrapper from "@/app/components/MainWrapper";
import { defaultCategories } from '@/app/lib/fetchMoviesByCategory';
import PaginationComponent from '@/app/components/PaginationComponent';
import { Movies } from '@/app/types/movie';
import SingleCategoryPageSkeleton from '@/app/components/skeletons/SingleCategoryPageSkeleton';
import { Suspense } from 'react';

const ITEMS_PER_PAGE = 20;

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

async function CategoryMoviesList({ slug, currentPage }: { slug: string, currentPage: number }) {
  const originalCategory = defaultCategories.find(cat => generateSlug(cat.title) === slug);

  if (!originalCategory) {
    return <p className="text-center text-slate-400 mt-10">Category not found.</p>;
  }

  const startFrom = (currentPage - 1) * ITEMS_PER_PAGE;

  const response = await fetchMoviesByFiltersForCategory(
    startFrom,
    ITEMS_PER_PAGE,
    originalCategory.year,
    originalCategory.genre,
    originalCategory.tag
  );

  const movies = response.data as Movies || [];
  const totalResults = response.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  if (movies.length === 0 && currentPage === 1) {
    return <p className="text-center text-slate-400 mt-10">No movies found for "{originalCategory.title}".</p>;
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
            basePath={`/category/${slug}/page`}
          />
        </div>
      )}
    </>
  );
}

export default async function CategoryMovieListPage({
  params
}: {
  params: Promise<{ slug: string, page: string }>;
}) {
  const resolvedParams = await params;
  const { slug, page: pageParam } = resolvedParams;
  const pageNum = parseInt(pageParam);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const originalCategory = defaultCategories.find(cat => generateSlug(cat.title) === slug);

  if (!originalCategory) {
    notFound();
  }

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen">
      <MainWrapper>
        <div className="pt-20 pb-10 px-4">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-center">
            {originalCategory.title}
          </h1>
          <p className="text-slate-400 text-center mb-10">
            Browse movies in the "{originalCategory.title}" category.
          </p>
          <Suspense
            key={`category-list-${slug}-${pageNum}`}
            fallback={<SingleCategoryPageSkeleton itemCount={ITEMS_PER_PAGE} />}
          >
            <CategoryMoviesList slug={slug} currentPage={pageNum} />
          </Suspense>
        </div>
      </MainWrapper>
    </main>
  );
}
