import { notFound } from "next/navigation";
import fetchAllMovies from "@/app/lib/fetchAllMovies";
import HomeMoviesList from "@/app/components/HomeMoviesList";
import MainWrapper from "@/app/components/MainWrapper";
import PaginationComponent from "@/app/components/PaginationComponent";

interface Props {
  params: Promise<{ page: string }>;
}
export default async function MovieListPage({ params }: Props) {
  const resolvedParams = await params;
  const pageNum = parseInt(resolvedParams.page);
  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const start = (pageNum - 1) * 20;
  const limit = 20;

  const response = await fetchAllMovies(start, limit);
  const totalPages = Math.ceil((response.total || 0) / 20);

  return (
    <main className="bg-black min-h-screen w-full">
      <MainWrapper>
        <div className="py-8">
          <h2 className="text-2xl font-bold text-white mb-6">All Movies - Page {pageNum}</h2>
          <HomeMoviesList movies={response.movies} />

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <PaginationComponent
                currentPage={pageNum}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </MainWrapper>
    </main>
  );
}
