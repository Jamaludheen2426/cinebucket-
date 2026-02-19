'use client';
import { MovieDetails, Movies } from "@/app/types/movie";
import Image from "next/image";
import Link from "next/link";
import MovieDescriptionClient from "./MovieDescriptionClient";
import { useSearchParams } from 'next/navigation';
import MainWrapper from "@/app/components/MainWrapper";
import { Star, Monitor, Globe, Play } from "lucide-react";
import DetailHero from "@/app/components/DetailHero";

export default function MovieDescription({
  movieDetails,
  relatedMovies,
}: {
  movieDetails: MovieDetails;
  relatedMovies?: Movies;
}) {
  if (!movieDetails) {
    return (
      <div className="min-h-screen bg-[#0f0101] flex items-center justify-center font-[family-name:var(--font-poppins)]">
        <div className="text-white text-xl animate-pulse uppercase tracking-[0.3em] font-black italic">Dimming the lights...</div>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const showVideo = searchParams.get('watch') === 'true';
  const iframe = movieDetails.iframe_src;

  const formatTitle = (name: string) => {
    return name.replace(/\s*\(\d{4}\)$/, "");
  };

  const getYear = () => {
    const yearMatch = movieDetails.name.match(/\((\d{4})\)$/);
    return yearMatch ? yearMatch[1] : movieDetails.year;
  };

  const formatDescription = (description: string | null) => {
    if (!description) return "No description available for this cinematic masterpiece.";
    return description
      .replace(/download movie .+?(?=\s*-\s*sinopsis|$)/i, "")
      .replace(/\s*-?\s*sinopsis plot synopsis/i, "")
      .replace(/mkv movies? king/i, "")
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#0f0101] text-white font-[family-name:var(--font-poppins)] selection:bg-[#fbbf24] selection:text-black">
      {!showVideo ? (
        <div className="relative w-full">
          {/* 🎬 Cinematic Hero Section */}
          <DetailHero
            name={movieDetails.name}
            backdrop={movieDetails.backdrop_path || null}
            poster={movieDetails.poster || null}
            year={getYear() as string}
            quality={movieDetails.quality}
          />

          <MainWrapper>
            <div className="relative -mt-32 md:-mt-48 lg:-mt-64 z-20 pb-20">
              <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start group">

                {/* 🎭 Poster Reveal with Premium Spotlight Effect */}
                <div className="w-full max-w-[340px] lg:max-w-[380px] flex-shrink-0 relative">
                  <div className="absolute -inset-10 bg-[#fbbf24]/5 blur-[100px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
                  <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] transition-all duration-700 group-hover:scale-[1.02] group-hover:border-[#fbbf24]/30">
                    <Image
                      src={movieDetails.poster || "/placeholder-poster.jpg"}
                      alt={movieDetails.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

                    {/* Premiere Badge */}
                    <div className="absolute top-6 left-6 px-5 py-2.5 bg-black/80 backdrop-blur-xl border border-[#fbbf24]/20 rounded-full flex items-center gap-2.5 shadow-2xl">
                      <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse shadow-[0_0_10px_#fbbf24]"></div>
                      <span className="text-[10px] font-black text-[#fbbf24] uppercase tracking-[0.2em] italic">Premiere Access</span>
                    </div>
                  </div>
                </div>

                {/* 🎞️ Cinematic Content Section */}
                <div className="flex-1 space-y-12 text-center lg:text-left pt-8 lg:pt-16">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                      {movieDetails.genre && movieDetails.genre.map((g, i) => (
                        <span key={i} className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.3em] bg-[#fbbf24]/5 px-4 py-2 border border-[#fbbf24]/10 rounded-none transform skew-x-[-12deg] hover:bg-[#fbbf24]/10 transition-colors cursor-default">
                          <span className="inline-block skew-x-[12deg]">{g}</span>
                        </span>
                      ))}
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase tracking-tighter italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                      {formatTitle(movieDetails.name)}
                      <span className="block text-[#fbbf24]/40 text-4xl mt-4 not-italic font-medium tracking-[0.2em]">{getYear()}</span>
                    </h1>
                  </div>

                  {/* ⭐ Premium Stats Bar */}
                  <div className="flex flex-wrap items-center gap-12 justify-center lg:justify-start py-10 border-y border-white/5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <Star className="w-8 h-8 text-[#fbbf24] fill-[#fbbf24] drop-shadow-[0_0_15px_#fbbf24]" />
                        <span className="text-5xl font-black text-white italic tracking-tighter">
                          {movieDetails.rating || "8.5"}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">Rating</span>
                          <span className="text-[#fbbf24]/40 text-[10px] font-bold">Recommended</span>
                        </div>
                      </div>
                      <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] bg-[length:200%_auto] animate-gradient shadow-[0_0_15px_#fbbf24]"
                          style={{ width: `${(Number(movieDetails.rating) || 8.5) * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="h-16 w-px bg-white/10 hidden md:block"></div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                        <Monitor className="w-4 h-4 text-[#fbbf24]" />
                        Format
                      </div>
                      <div className="text-white font-black text-xl uppercase tracking-tight italic drop-shadow-md">
                        {movieDetails.quality || "4K Ultra HD"}
                      </div>
                    </div>

                    <div className="h-16 w-px bg-white/10 hidden md:block"></div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                        <Globe className="w-4 h-4 text-[#fbbf24]" />
                        Audio
                      </div>
                      <div className="text-white font-black text-xl uppercase tracking-tight italic drop-shadow-md">
                        {movieDetails.language || "Dual Audio"}
                      </div>
                    </div>
                  </div>

                  {/* 🎬 Stylized Synopsis */}
                  <div className="space-y-6 relative max-w-4xl">
                    <div className="flex items-center gap-4">
                      <span className="text-[#fbbf24] font-black uppercase tracking-[0.6em] text-[10px]">The Narrative</span>
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-[#fbbf24]/40 to-transparent"></div>
                    </div>
                    <p className="text-gray-200/90 text-xl md:text-2xl leading-[1.6] font-medium italic relative z-10 drop-shadow-2xl antialiased">
                      "{formatDescription(movieDetails.description)}"
                    </p>
                  </div>

                  {/* 🏷️ Professional Metadata Labels */}
                  {movieDetails.tags && movieDetails.tags.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 justify-center lg:justify-start">
                        <div className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]"></div>
                        <h3 className="text-white/30 font-black uppercase tracking-[0.4em] text-[9px]">Production Metadata</h3>
                      </div>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        {movieDetails.tags.map((tag, index) => (
                          <Link
                            key={index}
                            href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                            className="group relative px-6 py-3 bg-white/[0.02] hover:bg-[#fbbf24]/5 text-white/40 hover:text-[#fbbf24] text-[9px] font-black uppercase tracking-widest border border-white/5 hover:border-[#fbbf24]/40 transition-all duration-700"
                          >
                            <span className="relative z-10">#{tag.trim()}</span>
                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#fbbf24] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Section Integration */}
              <div id="download" className="mt-32">
                <MovieDescriptionClient movieDetails={movieDetails} relatedMovies={relatedMovies} />
              </div>
            </div>
          </MainWrapper>
        </div>
      ) : (
        /* 📽️ Cinematic Player UI */
        <div className="bg-black min-h-screen flex flex-col">
          <div className="bg-[#120101] sticky top-0 z-50 px-10 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl">
            <div className="flex items-center gap-8">
              <Link
                href={`/movie/${movieDetails.id}`}
                className="text-white/40 hover:text-[#fbbf24] transition-all transform hover:scale-110"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className="space-y-1">
                <h2 className="text-white font-black text-2xl uppercase tracking-widest truncate max-w-2xl italic">
                  {movieDetails.name}
                </h2>
                <div className="flex items-center gap-4 text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>{getYear()}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span>Direct Premiere</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black w-full min-h-[calc(100vh-100px)] relative overflow-hidden">
            {/* Player Spotlight Effect */}
            <div className="absolute inset-0 bg-radial-gradient from-[#fbbf24]/5 via-transparent to-transparent opacity-30"></div>

            <div className="relative w-full h-full max-w-[1440px] aspect-video shadow-[0_0_100px_rgba(0,0,0,1)]">
              {iframe ? (
                <iframe
                  src={iframe}
                  className="w-full h-full border-0 rounded-sm"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="text-white text-xl p-4 flex flex-col items-center justify-center gap-8 min-h-[60vh]">
                  <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative group">
                    <div className="absolute inset-0 bg-[#fbbf24]/10 blur-xl rounded-full animate-pulse"></div>
                    <Play className="w-16 h-16 text-white/20 group-hover:text-[#fbbf24] transition-colors" />
                  </div>
                  <div className="text-center space-y-2">
                    <span className="text-white/40 uppercase tracking-[0.4em] font-black text-sm block">Reel Not Available</span>
                    <span className="text-white/10 text-[10px] font-bold uppercase">The screening is currently restricted or being updated.</span>
                  </div>
                  <Link
                    href={`/movie/${movieDetails.id}`}
                    className="px-12 py-4 bg-[#fbbf24] text-black rounded-none hover:bg-white transition-all font-black uppercase tracking-[0.2em] text-xs shadow-2xl"
                  >
                    Return to Lobby
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
