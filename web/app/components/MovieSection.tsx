"use client";

import React from "react";
import { Movies, MovieDetails } from "../types/movie";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css"; 

interface MovieSectionProps {
  title: string;
  movies: any; 
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  if (!movies) {
    return null;
  }
  
  const moviesArray = Array.isArray(movies) ? movies : [movies];
  
  if (moviesArray.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm flex items-center gap-1"
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        )}
      </div>

      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={3} 
          spaceBetween={10} 
          breakpoints={{
            640: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 5,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 7,
              spaceBetween: 20,
            },
          }}
          className="movie-category-slider"
        >
          {moviesArray.map((movie: any, index) => (
            <SwiperSlide key={movie.id || index} className="group">
              <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800">
              <Link href={`/movie/${movie.id}`}>
                {/* Movie Poster */}
                {(movie.poster || movie.poster_path) ? (
                  <Image
                    src={movie.poster || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || movie.name || 'Movie'}
                    fill
                    sizes="(max-width: 639px) 33vw, (max-width: 767px) 25vw, (max-width: 1023px) 20vw, (max-width: 1279px) 16vw, 14vw" // Responsive sizes
                    className="object-cover transition-transform duration-300 group-hover:scale-105" // Slightly smaller scale on hover
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}

                {/* Quality Badge */}
                {movie.quality && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                    {movie.quality}
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                  <h3 className="text-white font-semibold text-xs sm:text-sm mb-0.5 line-clamp-2">
                    {movie.name}
                  </h3>
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-300 mb-1">
                    <span>{movie.year}</span>
                    {movie.duration && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{movie.duration}</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-1.5">
                    <p

                      className="bg-yellow-500 hover:bg-yellow-600 text-black text-[10px] sm:text-xs font-bold py-1 px-1.5 rounded flex-1 text-center"
                    >
                      Details
                    </p>
                    <p
                      className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] sm:text-xs font-bold py-1 px-1.5 rounded flex-1 text-center"
                    >
                      Watch
                    </p>
                  </div>
                </div>
              </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default MovieSection;
