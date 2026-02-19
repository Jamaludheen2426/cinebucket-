"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { MovieDetails, Movies } from "../types/movie";
import Image from "next/image";
import Link from "next/link";
import MainWrapper from "@/app/components/MainWrapper";

export default function HomeSlider({ movies }: { movies: Movies }) {
  return (
    <MainWrapper>
      <div className="mb-16 relative">
        <div className="max-w-7xl mx-auto relative overflow-hidden">
          <div className="swiper-nav-buttons hidden md:block">
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 z-20 transform -translate-y-1/2">
              <div className="bg-black bg-opacity-50 p-4 rounded-full backdrop-blur-sm border border-gray-600">
                <ChevronLeft size={24} className="text-white" />
              </div>
            </button>

            <button className="swiper-button-next-custom absolute right-4 top-1/2 z-20 transform -translate-y-1/2">
              <div className="bg-black bg-opacity-50 p-4 rounded-full backdrop-blur-sm border border-gray-600">
                <ChevronRight size={24} className="text-white" />
              </div>
            </button>
          </div>

          <Swiper
            modules={[Navigation, Autoplay, EffectCoverflow]}
            effect="coverflow"
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            breakpoints={{
              320: {
                slidesPerView: 1.2,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: -30,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: -150,
              },
            }}
            className="movie-carousel py-4"
          >
            {Array.isArray(movies) && movies.map((movie: MovieDetails, index: number) => {
              const movieId = `movie-${index}`;

              return (
                <SwiperSlide key={index}>
                  <Link href={`/movie/${movie.id}`} passHref legacyBehavior>
                    <a className="block">
                      <div className="relative rounded-lg overflow-hidden transition-all duration-300">
                        <div className="relative aspect-[16/9] w-full h-[300px]">
                          <Image
                            src={movie.backdrop_path || movie.poster || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwZjE3MmEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzQ3NTVmYSIgZm9udC1zaXplPSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBCYWNrZHJvcDwvdGV4dD48L3N2Zz4='}
                            alt={movie.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 w-full flex flex-col items-start p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <h3 className="font-bold text-2xl text-white mb-2 drop-shadow-lg">
                              {movie.name}
                            </h3>
                            <div className="flex flex-wrap items-center text-base text-white font-semibold drop-shadow-lg gap-2">
                              <span className="flex items-center gap-1.5">
                                <svg
                                  width="18"
                                  height="18"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  className="inline-block"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M12 6v6l4 2"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {movie.duration}
                              </span>
                              <span>•</span>
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span>{movie.language || "English"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="swiper-button-prev-custom"></div>
          <div className="swiper-button-next-custom"></div>
          <div className="swiper-pagination"></div>
          <div className="flex justify-center gap-6 md:hidden mt-6">
            <button className="swiper-button-prev-custom">
              <div className="bg-black bg-opacity-50 p-3 rounded-full border border-gray-600">
                <ChevronLeft size={20} className="text-white" />
              </div>
            </button>

            <button className="swiper-button-next-custom">
              <div className="bg-black bg-opacity-50 p-3 rounded-full border border-gray-600">
                <ChevronRight size={20} className="text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainWrapper>
  );
}
