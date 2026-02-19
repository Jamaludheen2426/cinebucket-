"use client";
import React, { useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import HomeMoviesList from "../components/HomeMoviesList";
import MainWrapper from "../components/MainWrapper";
import PaginationComponent from "../components/PaginationComponent";
import { Movies, MovieDetails } from "../types/movie";
import ResultsPageSkeleton from "../components/skeletons/ResultsPageSkeleton";

const ITEMS_PER_PAGE = 20;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("search_query") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const tag = searchParams.get("tag") || "";
  const pageParam = searchParams.get("page") || "1";
  const currentPage = parseInt(pageParam, 10);

  const constructApiUrl = () => {
    let apiUrl = "/api/search?";
    const params = new URLSearchParams();

    if (query.trim()) {
      params.append("query", query);
    }
    if (genre) {
      params.append("genre", genre);
    }
    if (year) {
      params.append("year", year);
    }
    if (tag) {
      params.append("tag", tag);
    }
    params.append("page", currentPage.toString());

    apiUrl += params.toString();
    return query.trim() || genre || year || tag ? apiUrl : null;
  };

  const { data, error: swrError } = useSWR(
    constructApiUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  const isLoading = !data && !swrError && (query.trim() !== "" || genre !== "" || year !== "" || tag !== "");
  const error = swrError ? swrError.message : null;

  const { movieResults, totalResults } = useMemo(() => {
    if (!data) {
      return { movieResults: [], totalResults: 0 };
    }

    if (Array.isArray(data)) {
      const total = data.length;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedResults = data.slice(startIndex, endIndex);

      return {
        movieResults: paginatedResults as MovieDetails[],
        totalResults: total
      };
    } else if (data.results && Array.isArray(data.results)) {
      return {
        movieResults: data.results as MovieDetails[],
        totalResults: data.total || data.results.length
      };
    }

    return { movieResults: [], totalResults: 0 };
  }, [data, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append("search_query", query);
    }
    if (genre) {
      params.append("genre", genre);
    }
    if (year) {
      params.append("year", year);
    }
    if (tag) {
      params.append("tag", tag);
    }
    params.append("page", newPage.toString());
    router.push(`/results?${params.toString()}`);
  }, [query, genre, year, tag, router]);

  // Calculate total pages
  const totalPages = useMemo(() =>
    Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE)),
    [totalResults]
  );

  const movies = useMemo(() =>
    movieResults as unknown as Movies,
    [movieResults]
  );

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="pt-20 pb-10">
        <MainWrapper>
          <h1 className="text-2xl font-bold mb-6 px-4 text-white">
            {query ? `Results for "${query}"` : "Filtered Results"}
            {(genre || year || tag) && query && " (with filters)"}
          </h1>
          {(genre || year || tag) && !query && (
            <p className="text-gray-400 mb-4 px-4">
              Showing movies filtered by:
              {genre && ` Genre: ${genre}`}
              {year && ` Year: ${year}`}
              {tag && ` Tag: ${tag}`}
            </p>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
              <p>{error}</p>
            </div>
          )}
          {isLoading ? (
            <ResultsPageSkeleton itemCount={ITEMS_PER_PAGE} />
          ) : movieResults.length > 0 ? (
            <>
              <HomeMoviesList
                movies={movies}
                px="px-4"
              />
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    searchQuery={query}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-xl">No movies found matching your criteria.</p>
              <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </MainWrapper>
      </div>
    </div>
  );
}

const MemoizedResultsContent = React.memo(ResultsContent);

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <MemoizedResultsContent />
    </Suspense>
  );
}