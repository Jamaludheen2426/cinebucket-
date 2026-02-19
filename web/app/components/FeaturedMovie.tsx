import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieDetails } from '@/app/types/movie'; 

interface FeaturedMovieProps {
  movie: MovieDetails | null; 
}

const FeaturedMovie: React.FC<FeaturedMovieProps> = ({ movie }) => {
  if (!movie) {
    return (
      <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 animate-pulse">
        Featured Movie Loading...
      </div>
    );
  }

  return (
    <section className="relative h-[60vh] md:h-[75vh] w-full group mb-12 rounded-xl overflow-hidden shadow-2xl">
      {/* Background Image */}
      {(movie.backdrop_path || movie.poster) && (
        <Image
          src={movie.backdrop_path || movie.poster!}
          alt={movie.name || 'Featured movie backdrop'}
          fill
          className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
          priority
          quality={80}
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 lg:p-16 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 md:mb-4 shadow-lg">
          {movie.name}
        </h2>
        {movie.rating && (
          <div className="flex items-center gap-2 text-amber-400 mb-3 md:mb-4">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span className="font-semibold text-lg md:text-xl">{movie.rating}/10</span>
          </div>
        )}
        <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-4 md:mb-6 line-clamp-3 leading-relaxed max-w-xl shadow-sm">
          {movie.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link
            href={`/movie/${movie.id}?watch=true`}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm md:text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"></path>
            </svg>
            Watch Now
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="px-6 py-3 bg-slate-700/70 text-slate-200 rounded-lg hover:bg-slate-600/90 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm md:text-base"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovie;