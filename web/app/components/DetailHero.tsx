"use client";
import React from "react";
import Image from "next/image";
import { Star, Clock, Calendar, Globe } from "lucide-react";

interface DetailHeroProps {
    name: string;
    backdrop: string | null;
    poster: string | null;
    year: string;
    rating?: string | number;
    duration?: string;
    quality?: string;
}

export default function DetailHero({ name, backdrop, poster, year, rating, duration, quality }: DetailHeroProps) {
    return (
        <div className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden font-[family-name:var(--font-poppins)]">
            {/* 🎞️ Immersive Background Layer */}
            <div className="absolute inset-0 z-0">
                {backdrop ? (
                    <Image
                        src={backdrop}
                        alt={name}
                        fill
                        className="object-cover scale-110 brightness-[0.4] blur-[3px]"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-[#0a0000]" />
                )}
                {/* Cinema Gradation */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f0101] via-transparent to-[#0f0101]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0101] via-transparent to-[#0f0101]"></div>

                {/* Theatre Floor Light Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0f0101] to-transparent"></div>
            </div>

            {/* 🎭 Theatre Screen Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent z-10 shadow-[0_0_20px_#fbbf24]"></div>

            {/* 🏛️ Stage Elements (Curtain Shadowing) */}
            <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#0f0101] to-transparent z-10 opacity-80"></div>
            <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#0f0101] to-transparent z-10 opacity-80"></div>

            {/* 🎞️ Content Overlay */}
            <div className="relative z-20 h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-in fade-in slide-in-from-top-10 duration-1000 space-y-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[#fbbf24] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {year}
                        </span>
                        {quality && (
                            <span className="bg-[#fbbf24] text-black px-3 py-1 rounded-none transform skew-x-[-15deg]">
                                <span className="inline-block skew-x-[15deg]">{quality}</span>
                            </span>
                        )}
                        {duration && (
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" /> {duration}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Spotlight Beam */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-full bg-conic-spotlight pointer-events-none opacity-20"></div>

            <style jsx>{`
                .bg-conic-spotlight {
                    background: conic-gradient(from 180deg at 50% 0%, transparent 160deg, rgba(251,191,36,0.1) 180deg, transparent 200deg);
                }
            `}</style>
        </div>
    );
}
