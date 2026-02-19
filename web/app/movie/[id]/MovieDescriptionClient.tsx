"use client";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovieDetails, Movies } from "@/./app/types/movie";
import Link from "next/link";
import MovieSection from "@/app/components/MovieSection";
import { Download, Monitor, Subtitles, Share2, FileText, Ticket } from "lucide-react";

interface DownloadLink {
  type: string;
  quality: string;
  url: string;
  label?: string;
  name?: string;
}

export default function MovieInteractive({
  movieDetails,
  relatedMovies,
}: {
  movieDetails: MovieDetails;
  relatedMovies?: Movies;
}) {
  const [activeTab, setActiveTab] = useState<'gdrive' | 'direct' | 'subtitles' | 'stream' | 'all' | null>(null);

  const getQuality = (link: {
    quality?: string;
    label?: string;
    name?: string;
  }) => {
    if (link.quality) return link.quality;
    const textToSearch = (link.label || link.name || "").toUpperCase();
    const qualityMatches = textToSearch.match(/\d+P|480P|720P|1080P|2160P|4K|HD|SD|WEB-DL|BLURAY/i);
    if (qualityMatches) return qualityMatches[0];
    return movieDetails.quality || "HD";
  };

  const getDownloadType = (link: {
    quality?: string;
    label?: string;
    url?: string;
  }) => {
    const urlOrLabel = (link.label || link.url || "").toLowerCase();
    if (urlOrLabel.includes("gdrive") || urlOrLabel.includes("drive.google") || urlOrLabel.includes("google drive")) {
      return "Google Drive";
    } else if (urlOrLabel.includes("subtitle") || urlOrLabel.includes("translated")) {
      return "Subtitle";
    } else if (urlOrLabel.includes("embed") || urlOrLabel.includes("player") || urlOrLabel.includes("stream") || urlOrLabel.includes("watch")) {
      return "Stream";
    } else if (urlOrLabel.includes("direct") || urlOrLabel.includes("download") || urlOrLabel.includes("mkv") || urlOrLabel.includes("mp4") || urlOrLabel.includes("rar") || urlOrLabel.includes("zip")) {
      return "Direct";
    }
    return "Other";
  };

  const allLinks = useMemo(() => {
    const links = Array.isArray(movieDetails.download_links) ? movieDetails.download_links : [];
    return links.map((link) => ({
      ...link,
      type: getDownloadType(link),
      quality: getQuality(link),
    })) as DownloadLink[];
  }, [movieDetails.download_links]);

  const gdriveLinks = allLinks.filter(link => link.type === "Google Drive");
  const directLinks = allLinks.filter(link => link.type === "Direct");
  const subtitleLinks = allLinks.filter(link => link.type === "Subtitle");
  const streamLinks = allLinks.filter(link => link.type === "Stream");
  const otherLinks = allLinks.filter(link => link.type === "Other");

  // Choose initial tab
  useMemo(() => {
    if (!activeTab && allLinks.length > 0) {
      if (streamLinks.length > 0) setActiveTab('stream');
      else if (gdriveLinks.length > 0) setActiveTab('gdrive');
      else if (directLinks.length > 0) setActiveTab('direct');
      else if (subtitleLinks.length > 0) setActiveTab('subtitles');
      else setActiveTab('all');
    }
  }, [allLinks, activeTab, streamLinks.length, gdriveLinks.length, directLinks.length, subtitleLinks.length]);

  return (
    <div className="mt-24 font-[family-name:var(--font-poppins)]">
      {/* 🎟️ Premium Download Section Wrapper */}
      <div className="relative bg-[#1a0101]/40 backdrop-blur-2xl p-10 md:p-16 rounded-none border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fbbf24]/5 blur-[120px] rounded-full -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="flex items-center gap-4 mb-4">
              <Ticket className="w-6 h-6 text-[#fbbf24]" />
              <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-[0.4em] italic drop-shadow-lg">Production Box Office</h3>
            </div>
            <div className="h-1.5 w-32 bg-[#fbbf24] shadow-[0_0_15px_#fbbf24]"></div>
            <p className="mt-6 text-white/40 text-[10px] uppercase font-black tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse"></span>
              Select your preferred screening format
            </p>
          </div>

          {/* 🎬 Cinematic Navigation Tabs */}
          <div className="flex flex-wrap gap-5 justify-center items-center mb-16">
            {allLinks.length > 0 ? (
              <>
                {[
                  { id: 'stream', label: 'Watch Online', icon: Monitor, show: streamLinks.length > 0 },
                  { id: 'gdrive', label: 'Cloud Drive', icon: Download, show: gdriveLinks.length > 0 },
                  { id: 'direct', label: 'Direct Link', icon: Download, show: directLinks.length > 0 },
                  { id: 'subtitles', label: 'Subtitles', icon: Subtitles, show: subtitleLinks.length > 0 },
                  { id: 'all', label: 'Other Files', icon: FileText, show: otherLinks.length > 0 }
                ].filter(t => t.show).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group relative px-8 py-5 transition-all duration-500 overflow-hidden transform skew-x-[-15deg] border
                      ${activeTab === tab.id
                        ? 'bg-[#fbbf24] text-black border-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.3)]'
                        : 'bg-white/[0.03] text-white/50 border-white/5 hover:border-[#fbbf24]/50 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-4 skew-x-[15deg]">
                      <tab.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${activeTab === tab.id ? 'text-black' : 'text-[#fbbf24]'}`} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                    </div>
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 py-20 border border-dashed border-white/5 rounded-none w-full bg-white/[0.01]">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fbbf24]/10 blur-xl rounded-full"></div>
                  <Download className="w-16 h-16 text-white/10 relative z-10" />
                </div>
                <p className="text-white/20 text-center font-black uppercase tracking-[0.4em] text-xs italic">The premiere reels are being distributed...</p>
              </div>
            )}

            <button
              className="px-8 py-5 transition-all duration-500 transform skew-x-[-15deg] border border-white/10 bg-white/[0.05] text-white/40 hover:text-white hover:border-white/30"
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({
                    title: movieDetails.name,
                    text: `Check out ${movieDetails.name}!`,
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Premiere link secured to clipboard!'))
                    .catch(() => alert('Could not secure link.'));
                }
              }}
            >
              <div className="flex items-center gap-4 skew-x-[15deg]">
                <Share2 className="w-5 h-5 text-white/40" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Share Premiere</span>
              </div>
            </button>
          </div>

          {/* 📊 Premium Data Table */}
          {activeTab && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="overflow-hidden bg-black/40 border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <Table>
                  <TableHeader className="bg-white/[0.02] border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-white/30 font-black uppercase tracking-[0.3em] text-center py-8 px-10 text-[10px]">Format / Resolution</TableHead>
                      <TableHead className="text-white/30 font-black uppercase tracking-[0.3em] text-center py-8 px-10 text-[10px]">Production Identifier</TableHead>
                      <TableHead className="text-white/30 font-black uppercase tracking-[0.3em] text-center py-8 px-10 text-[10px]">Access Control</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(activeTab === 'gdrive' ? gdriveLinks : activeTab === 'direct' ? directLinks : activeTab === 'subtitles' ? subtitleLinks : activeTab === 'stream' ? streamLinks : otherLinks).map((link, index) => (
                      <TableRow key={index} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group">
                        <TableCell className="py-8 px-10 text-center">
                          <span className="inline-block px-5 py-2 bg-black text-[#fbbf24] font-black text-[11px] uppercase tracking-tighter border border-[#fbbf24]/20 group-hover:border-[#fbbf24]/60 transition-all duration-500">
                            {activeTab === 'subtitles' ? "SRT/VTT" : link.quality}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/60 font-medium text-center py-8 px-10 text-xs max-w-[280px] truncate italic group-hover:text-white transition-colors">
                          {link.label || "Master Archive Copy"}
                        </TableCell>
                        <TableCell className="text-center py-8 px-10">
                          <Link
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 text-[#fbbf24] hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all group/btn"
                          >
                            Get Premiere Access
                            <div className="w-10 h-10 rounded-none transform skew-x-[-10deg] border border-[#fbbf24]/40 flex items-center justify-center transition-all group-hover/btn:bg-[#fbbf24] group-hover/btn:border-[#fbbf24]">
                              <Download className="w-4 h-4 text-[#fbbf24] group-hover/btn:text-black skew-x-[10deg] transition-all duration-500" />
                            </div>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🎬 Related Screenings */}
      {relatedMovies && relatedMovies.length > 0 && (
        <div className="mt-40 pb-32">
          <div className="flex flex-col items-center lg:items-start mb-16 px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-[2px] bg-[#fbbf24]"></div>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg">Similar Screenings</h3>
            </div>
            <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em] lg:ml-14">Extended repertoire from our archives</p>
          </div>
          <MovieSection title="" movies={relatedMovies} />
        </div>
      )}
    </div>
  );
}
