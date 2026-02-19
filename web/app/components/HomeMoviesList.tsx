import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import React from "react";
import Link from "next/link";
import { Movies } from "../types/movie";
import PaginationComponent from "./PaginationComponent";
import Image from "next/image";
import MainWrapper from "@/app/components/MainWrapper";

interface HomeMoviesListProps {
  movies: Movies;
  px?: string;
}

const HomeMoviesList: React.FC<HomeMoviesListProps> = ({
  movies,
  px = "px-4",
}) => {
  return (
    <div className="bg-transparent text-white min-h-screen py-8">
      <MainWrapper>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {Array.isArray(movies) && movies.map((_movie, index) => (
            <Link
              key={index}
              className="group overflow-hidden text-left rounded-lg transition-all duration-300 hover:scale-105"
              href={`/movie/${_movie.id}`}
            >
              {/* ... movie card code ... */}
              <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-800/40 backdrop-blur-sm border border-gray-700/50">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <Image
                    src={_movie.poster || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5NGEzYjgiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                    alt={_movie.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={300}
                    height={450}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {_movie.rating && (
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-1 text-sm text-white">{_movie.rating}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-300">{_movie.year}</p>
                      {_movie.genres && _movie.genres.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{_movie.genres[0]}</p>
                      )}
                    </div>
                  </div>
                  {_movie.quality && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md">
                      {_movie.quality}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm md:text-base text-white line-clamp-1 group-hover:text-yellow-400 transition-colors duration-300">
                    {_movie.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1 flex-wrap gap-2">
                    <span>{_movie.year}</span>
                    {_movie.duration && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{_movie.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </MainWrapper>
    </div>
  );
};

export default HomeMoviesList;
