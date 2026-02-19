"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { Movies } from "../types/movie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Inline Search ─────────────────────────────────────────── */
function TheaterSearch() {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [genre, setGenre] = useState("");
    const [year, setYear] = useState("");
    const [tag, setTag] = useState("");

    const buildQuery = () => {
        const p: string[] = [];
        if (genre) p.push(`genre=${encodeURIComponent(genre)}`);
        if (year) p.push(`year=${encodeURIComponent(year)}`);
        if (tag) p.push(`tag=${encodeURIComponent(tag)}`);
        return p.length ? `&${p.join("&")}` : "";
    };
    const go = () => {
        if (q.trim()) router.push(`/results?search_query=${encodeURIComponent(q)}${buildQuery()}`);
        else if (genre || year || tag) router.push(`/results?${buildQuery().substring(1)}`);
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-3 bg-[#0c0800]/90 border border-[#8b6914]/50 rounded-full px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#d4a017" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text" value={q}
                    onChange={e => setQ(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && go()}
                    placeholder="Search for your favorite movie..."
                    className="flex-1 bg-transparent outline-none text-[#f5d78e] placeholder:text-[#6b5a2a] text-sm md:text-base"
                />
                <div className="h-5 w-px bg-[#8b6914]/40 shrink-0" />
                <button onClick={() => setOpen(o => !o)}
                    className="flex items-center gap-2 bg-[#1a0f00] hover:bg-[#2a1a00] border border-[#8b6914]/40 text-[#d4a017] text-xs font-bold px-4 py-1.5 rounded-full transition-all shrink-0 tracking-widest uppercase">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <line x1="4" y1="5" x2="16" y2="5" /><line x1="4" y1="12" x2="10" y2="12" />
                        <line x1="14" y1="12" x2="20" y2="12" /><line x1="8" y1="19" x2="20" y2="19" />
                        <circle cx="18" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="6" cy="19" r="2" />
                    </svg>
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>
            {open && (
                <div className="absolute bottom-full left-0 right-0 mb-3 z-50">
                    <div className="bg-[#100a00] border border-[#8b6914]/50 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row gap-4">
                        {[
                            { label: "Genre", val: genre, set: setGenre, opts: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"] },
                            { label: "Year", val: year, set: setYear, opts: ["2024", "2023", "2022", "2021", "2020"] },
                            { label: "Tag", val: tag, set: setTag, opts: ["Popular", "New Release", "Classic", "Award Winning"] },
                        ].map(({ label, val, set, opts }) => (
                            <div key={label} className="flex flex-col gap-1.5 flex-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4a017]/70">{label}</span>
                                <select value={val} onChange={e => set(e.target.value)}
                                    className="w-full bg-[#1a0f00] text-[#f5d78e] border border-[#8b6914]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a017] cursor-pointer">
                                    <option value="">All {label}s</option>
                                    {opts.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div className="flex items-end">
                            <button onClick={() => { setOpen(false); go(); }}
                                className="w-full sm:w-auto bg-[#d4a017] hover:bg-[#e6b420] text-black font-black px-8 py-2 rounded-lg transition-all active:scale-95 text-sm tracking-widest uppercase">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Audience with seats + people silhouettes ──────────────── */
function AudienceSection() {
    // Each person: x, y(feet), pose: 'sit'|'cheer'|'raise'|'lean'
    const people: { x: number; y: number; pose: string; scale: number; opacity: number }[] = [
        // Row 3 (far, small)
        { x: 55, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 145, y: 148, pose: "cheer", scale: 0.52, opacity: 0.35 },
        { x: 235, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 325, y: 148, pose: "raise", scale: 0.52, opacity: 0.35 },
        { x: 415, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 505, y: 148, pose: "lean", scale: 0.52, opacity: 0.35 },
        { x: 595, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 685, y: 148, pose: "cheer", scale: 0.52, opacity: 0.35 },
        { x: 775, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 865, y: 148, pose: "raise", scale: 0.52, opacity: 0.35 },
        { x: 955, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        { x: 1045, y: 148, pose: "lean", scale: 0.52, opacity: 0.35 },
        { x: 1135, y: 148, pose: "sit", scale: 0.52, opacity: 0.35 },
        // Row 2 (mid)
        { x: 42, y: 178, pose: "cheer", scale: 0.68, opacity: 0.58 },
        { x: 142, y: 178, pose: "sit", scale: 0.68, opacity: 0.58 },
        { x: 242, y: 178, pose: "raise", scale: 0.68, opacity: 0.58 },
        { x: 342, y: 178, pose: "sit", scale: 0.68, opacity: 0.58 },
        { x: 442, y: 178, pose: "lean", scale: 0.68, opacity: 0.58 },
        { x: 542, y: 178, pose: "cheer", scale: 0.68, opacity: 0.58 },
        { x: 642, y: 178, pose: "sit", scale: 0.68, opacity: 0.58 },
        { x: 742, y: 178, pose: "raise", scale: 0.68, opacity: 0.58 },
        { x: 842, y: 178, pose: "sit", scale: 0.68, opacity: 0.58 },
        { x: 942, y: 178, pose: "cheer", scale: 0.68, opacity: 0.58 },
        { x: 1042, y: 178, pose: "lean", scale: 0.68, opacity: 0.58 },
        { x: 1142, y: 178, pose: "sit", scale: 0.68, opacity: 0.58 },
        // Row 1 (front, large)
        { x: 20, y: 218, pose: "sit", scale: 0.92, opacity: 1.0 },
        { x: 130, y: 218, pose: "cheer", scale: 0.92, opacity: 1.0 },
        { x: 240, y: 218, pose: "raise", scale: 0.92, opacity: 1.0 },
        { x: 350, y: 218, pose: "sit", scale: 0.92, opacity: 1.0 },
        { x: 460, y: 218, pose: "lean", scale: 0.92, opacity: 1.0 },
        { x: 570, y: 218, pose: "sit", scale: 0.92, opacity: 1.0 },
        { x: 680, y: 218, pose: "cheer", scale: 0.92, opacity: 1.0 },
        { x: 790, y: 218, pose: "raise", scale: 0.92, opacity: 1.0 },
        { x: 900, y: 218, pose: "sit", scale: 0.92, opacity: 1.0 },
        { x: 1010, y: 218, pose: "lean", scale: 0.92, opacity: 1.0 },
        { x: 1110, y: 218, pose: "cheer", scale: 0.92, opacity: 1.0 },
    ];

    // Draw a person silhouette based on pose
    // x,y = anchor (hip/seat level), s = scale
    const Person = ({ x, y, pose, s, op }: { x: number; y: number; pose: string; s: number; op: number }) => {
        const fill = "#0a0202";
        // Body parts relative to anchor
        // Head radius
        const hr = 9 * s;
        // Torso
        const tw = 14 * s;

        if (pose === "sit") {
            // Sitting: head, torso leaning slightly back, arms resting
            return (
                <g opacity={op} fill={fill}>
                    {/* seat back behind person */}
                    {/* Head */}
                    <ellipse cx={x} cy={y - 62 * s} rx={hr} ry={hr * 1.1} />
                    {/* Neck */}
                    <rect x={x - 4 * s} y={y - 52 * s} width={8 * s} height={8 * s} rx={2 * s} />
                    {/* Torso */}
                    <path d={`M${x - tw},${y - 44 * s} Q${x - tw - 4 * s},${y - 22 * s} ${x - tw + 2 * s},${y} L${x + tw - 2 * s},${y} Q${x + tw + 4 * s},${y - 22 * s} ${x + tw},${y - 44 * s} Z`} />
                    {/* Left arm resting */}
                    <path d={`M${x - tw},${y - 38 * s} Q${x - tw - 14 * s},${y - 20 * s} ${x - tw - 10 * s},${y - 2 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                    {/* Right arm resting */}
                    <path d={`M${x + tw},${y - 38 * s} Q${x + tw + 14 * s},${y - 20 * s} ${x + tw + 10 * s},${y - 2 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                </g>
            );
        }

        if (pose === "cheer") {
            // Both arms raised up celebrating
            return (
                <g opacity={op} fill={fill}>
                    <ellipse cx={x} cy={y - 64 * s} rx={hr} ry={hr * 1.1} />
                    <rect x={x - 4 * s} y={y - 54 * s} width={8 * s} height={8 * s} rx={2 * s} />
                    <path d={`M${x - tw},${y - 46 * s} Q${x - tw - 2 * s},${y - 22 * s} ${x - tw + 2 * s},${y} L${x + tw - 2 * s},${y} Q${x + tw + 2 * s},${y - 22 * s} ${x + tw},${y - 46 * s} Z`} />
                    {/* Left arm up */}
                    <path d={`M${x - tw},${y - 40 * s} Q${x - tw - 22 * s},${y - 58 * s} ${x - tw - 14 * s},${y - 78 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                    {/* Left fist */}
                    <circle cx={x - tw - 14 * s} cy={y - 82 * s} r={5 * s} fill={fill} />
                    {/* Right arm up */}
                    <path d={`M${x + tw},${y - 40 * s} Q${x + tw + 22 * s},${y - 58 * s} ${x + tw + 14 * s},${y - 78 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                    {/* Right fist */}
                    <circle cx={x + tw + 14 * s} cy={y - 82 * s} r={5 * s} fill={fill} />
                </g>
            );
        }

        if (pose === "raise") {
            // One arm raised, one resting
            return (
                <g opacity={op} fill={fill}>
                    <ellipse cx={x} cy={y - 62 * s} rx={hr} ry={hr * 1.1} />
                    <rect x={x - 4 * s} y={y - 52 * s} width={8 * s} height={8 * s} rx={2 * s} />
                    <path d={`M${x - tw},${y - 44 * s} Q${x - tw - 2 * s},${y - 22 * s} ${x - tw + 2 * s},${y} L${x + tw - 2 * s},${y} Q${x + tw + 2 * s},${y - 22 * s} ${x + tw},${y - 44 * s} Z`} />
                    {/* Right arm raised */}
                    <path d={`M${x + tw},${y - 40 * s} Q${x + tw + 18 * s},${y - 55 * s} ${x + tw + 10 * s},${y - 74 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                    <circle cx={x + tw + 10 * s} cy={y - 78 * s} r={5 * s} fill={fill} />
                    {/* Left arm resting */}
                    <path d={`M${x - tw},${y - 38 * s} Q${x - tw - 14 * s},${y - 20 * s} ${x - tw - 10 * s},${y - 2 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                </g>
            );
        }

        if (pose === "lean") {
            // Leaning forward, head tilted toward screen
            return (
                <g opacity={op} fill={fill}>
                    <ellipse cx={x + 6 * s} cy={y - 58 * s} rx={hr} ry={hr * 1.05} />
                    <rect x={x + 2 * s} y={y - 49 * s} width={8 * s} height={8 * s} rx={2 * s} />
                    <path d={`M${x - tw + 4 * s},${y - 42 * s} Q${x - tw + 6 * s},${y - 20 * s} ${x - tw + 8 * s},${y} L${x + tw + 4 * s},${y} Q${x + tw + 8 * s},${y - 20 * s} ${x + tw + 4 * s},${y - 42 * s} Z`} />
                    {/* Both arms forward/down */}
                    <path d={`M${x - tw + 4 * s},${y - 36 * s} Q${x - tw - 6 * s},${y - 16 * s} ${x - tw - 4 * s},${y - 2 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                    <path d={`M${x + tw + 4 * s},${y - 36 * s} Q${x + tw + 14 * s},${y - 16 * s} ${x + tw + 12 * s},${y - 2 * s}`} stroke={fill} strokeWidth={7 * s} fill="none" strokeLinecap="round" />
                </g>
            );
        }

        return null;
    };

    // Seat colors
    const seatDark = "#160404";
    const seatMid = "#220606";
    const seatLight = "#320a0a";

    const Seat = ({ x, y, s = 1, op = 1 }: { x: number; y: number; s?: number; op?: number }) => {
        const w = 58 * s;
        const bh = 48 * s;
        const sh = 14 * s;
        const hw = 38 * s;
        const hr = 10 * s;
        const cx = x + w / 2;
        return (
            <g opacity={op}>
                {/* Backrest */}
                <path d={`M${x + 3 * s},${y} L${x},${y - bh + 7 * s} Q${x},${y - bh} ${x + 7 * s},${y - bh} L${x + w - 7 * s},${y - bh} Q${x + w},${y - bh} ${x + w},${y - bh + 7 * s} L${x + w - 3 * s},${y} Z`} fill={seatMid} />
                {/* Backrest inner panel */}
                <path d={`M${x + 7 * s},${y - 3 * s} L${x + 5 * s},${y - bh + 12 * s} Q${x + 5 * s},${y - bh + 5 * s} ${x + 13 * s},${y - bh + 5 * s} L${x + w - 13 * s},${y - bh + 5 * s} Q${x + w - 5 * s},${y - bh + 5 * s} ${x + w - 5 * s},${y - bh + 12 * s} L${x + w - 7 * s},${y - 3 * s} Z`} fill={seatLight} opacity="0.55" />
                {/* Headrest */}
                <rect x={cx - hw / 2} y={y - bh - hr + 1 * s} width={hw} height={hr} rx={5 * s} fill={seatLight} />
                <rect x={cx - hw / 2 + 3 * s} y={y - bh - hr + 2 * s} width={hw - 6 * s} height={3 * s} rx={1.5 * s} fill="#4a1010" opacity="0.5" />
                {/* Seat pad */}
                <rect x={x - 2 * s} y={y - sh} width={w + 4 * s} height={sh} rx={3 * s} fill={seatDark} />
                <rect x={x + 2 * s} y={y - sh + 2 * s} width={w - 4 * s} height={sh - 5 * s} rx={2 * s} fill={seatMid} opacity="0.7" />
                {/* Armrests */}
                <rect x={x - 2 * s} y={y - sh - 5 * s} width={7 * s} height={9 * s} rx={2.5 * s} fill={seatDark} />
                <rect x={x + w - 5 * s} y={y - sh - 5 * s} width={7 * s} height={9 * s} rx={2.5 * s} fill={seatDark} />
            </g>
        );
    };

    return (
        <svg viewBox="0 0 1200 230" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Floor */}
            <rect x="0" y="210" width="1200" height="20" fill="#050101" />

            {/* ── Row 3 seats (far) ── */}
            {[...Array(13)].map((_, i) => <Seat key={`s3-${i}`} x={i * 90 + 10} y={152} s={0.55} op={0.32} />)}
            {/* ── Row 2 seats (mid) ── */}
            {[...Array(13)].map((_, i) => <Seat key={`s2-${i}`} x={i * 92 + 4} y={182} s={0.70} op={0.55} />)}
            {/* ── Row 1 seats (front) ── */}
            {[...Array(11)].map((_, i) => <Seat key={`s1-${i}`} x={i * 108 + 6} y={220} s={0.94} op={1.0} />)}

            {/* ── People on seats ── */}
            {people.map((p, i) => (
                <Person key={i} x={p.x} y={p.y} pose={p.pose} s={p.scale} op={p.opacity} />
            ))}

            {/* Floor gradient fade */}
            <rect x="0" y="200" width="1200" height="30" fill="url(#floorFade)" />
            <defs>
                <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#050101" stopOpacity="0" />
                    <stop offset="100%" stopColor="#020000" stopOpacity="1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Projector Beam ─────────────────────────────────────────── */
function ProjectorBeam() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 900"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Main beam gradient: bright at source (top center-back), wide & faint at screen */}
                <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.22" />
                    <stop offset="40%" stopColor="#ffe8a0" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#ffd060" stopOpacity="0.03" />
                </linearGradient>
                {/* Dust particle shimmer */}
                <filter id="beamBlur">
                    <feGaussianBlur stdDeviation="6" />
                </filter>
            </defs>

            {/* Wide projector cone: from top-center back down to screen area */}
            <polygon
                points="580,0  620,0  860,520  340,520"
                fill="url(#beamGrad)"
                filter="url(#beamBlur)"
                opacity="0.9"
            />
            {/* Tighter inner bright core */}
            <polygon
                points="594,0  606,0  720,520  480,520"
                fill="url(#beamGrad)"
                filter="url(#beamBlur)"
                opacity="0.7"
            />
            {/* Projector lens source glow */}
            <ellipse cx="600" cy="8" rx="22" ry="8"
                fill="#fff9e0" opacity="0.55"
                filter="url(#beamBlur)"
            />
            <ellipse cx="600" cy="4" rx="10" ry="4"
                fill="#ffffff" opacity="0.8"
            />

            {/* Dust motes — scattered bright dots in the beam */}
            {[
                [598, 80, 1.4], [570, 130, 1], [610, 160, 0.9], [555, 220, 1.2], [630, 200, 0.8],
                [575, 270, 1.3], [620, 300, 1], [590, 350, 0.9], [560, 380, 1.1], [640, 400, 0.7],
                [605, 440, 1], [575, 460, 1.2], [625, 480, 0.8], [550, 500, 0.9], [650, 510, 1],
            ].map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r as number}
                    fill="#fff8d0" opacity={0.5 + Math.random() * 0.4}
                />
            ))}
        </svg>
    );
}

/* ─── Main TheaterHero ───────────────────────────────────────── */
export default function TheaterHero({ movies }: { movies: Movies }) {
    const featuredMovies = Array.isArray(movies) ? movies.slice(0, 5) : [];

    return (
        <div
            className="relative w-full cinema-theater"
            style={{ minHeight: "100vh", overflow: "hidden", background: "#060100" }}
        >
            {/* Ambient bg */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 90% 70% at 50% 20%, #180400 0%, #060100 65%, #000 100%)" }}
            />

            {/* Art Deco top border */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
                <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #d4a017 20%, #f5d78e 50%, #d4a017 80%, transparent)" }} />
                <div style={{ height: "1px", marginTop: "3px", background: "linear-gradient(90deg, transparent, #8b6914 30%, #8b6914 70%, transparent)" }} />
            </div>

            {/* ══ LEFT CURTAIN (no sconces) ══ */}
            <div className="absolute inset-y-0 left-0 z-40 hidden md:block" style={{ width: "19%" }}>
                <div className="h-full w-full relative"
                    style={{ background: "linear-gradient(to right, #1e0000, #4a0101 45%, #380101 75%, #200000)" }}>
                    {/* Velvet fold strips */}
                    {[...Array(14)].map((_, i) => (
                        <div key={i} className="absolute top-0 h-full" style={{
                            left: `${i * 7.2}%`, width: "7.5%",
                            background: i % 2 === 0
                                ? "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(70,3,3,0.08) 50%, rgba(0,0,0,0.08) 100%)"
                                : "linear-gradient(to right, rgba(60,2,2,0.04) 0%, rgba(100,8,8,0.14) 40%, rgba(0,0,0,0.52) 100%)",
                        }} />
                    ))}
                    {/* Curtain top gather shadow */}
                    <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)" }} />
                    {/* Edge shadow toward screen */}
                    <div className="absolute inset-y-0 right-0 w-10 pointer-events-none"
                        style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.9))" }} />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                </div>
            </div>

            {/* ══ RIGHT CURTAIN (no sconces) ══ */}
            <div className="absolute inset-y-0 right-0 z-40 hidden md:block" style={{ width: "19%" }}>
                <div className="h-full w-full relative"
                    style={{ background: "linear-gradient(to left, #1e0000, #4a0101 45%, #380101 75%, #200000)" }}>
                    {[...Array(14)].map((_, i) => (
                        <div key={i} className="absolute top-0 h-full" style={{
                            right: `${i * 7.2}%`, width: "7.5%",
                            background: i % 2 === 0
                                ? "linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(70,3,3,0.08) 50%, rgba(0,0,0,0.08) 100%)"
                                : "linear-gradient(to left, rgba(60,2,2,0.04) 0%, rgba(100,8,8,0.14) 40%, rgba(0,0,0,0.52) 100%)",
                        }} />
                    ))}
                    <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)" }} />
                    <div className="absolute inset-y-0 left-0 w-10 pointer-events-none"
                        style={{ background: "linear-gradient(to left, transparent, rgba(0,0,0,0.9))" }} />
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                </div>
            </div>

            {/* ══ PROJECTOR BEAM (z behind screen, above bg) ══ */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <ProjectorBeam />
            </div>

            {/* ══ SCREEN ══ */}
            <div className="relative z-30 flex flex-col items-center" style={{ paddingTop: "44px", paddingBottom: "280px" }}>
                <div className="w-full px-4 md:px-0 animate-screen-in" style={{ maxWidth: "860px" }}>
                    {/* Gold outer ring */}
                    <div style={{ padding: "3px", background: "linear-gradient(180deg,#3a2a00,#1a1400)", borderRadius: "6px", boxShadow: "0 0 80px rgba(212,160,23,0.1), 0 0 200px rgba(0,0,0,0.95)" }}>
                        <div style={{ background: "#050310", borderRadius: "4px", padding: "10px", boxShadow: "inset 0 0 30px rgba(0,0,0,0.9)" }}>
                            <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", borderRadius: "2px" }}>
                                <Swiper
                                    modules={[Autoplay, EffectFade]}
                                    effect="fade"
                                    autoplay={{ delay: 6000, disableOnInteraction: false }}
                                    loop={true}
                                    className="w-full h-full"
                                >
                                    {featuredMovies.map((movie, idx) => (
                                        <SwiperSlide key={idx}>
                                            <Link href={`/movie/${movie.id}`}>
                                                <div className="relative w-full h-full group/slide cursor-pointer">
                                                    <Image
                                                        src={movie.backdrop_path || movie.poster || "/placeholder-backdrop.jpg"}
                                                        alt={movie.name} fill
                                                        className="object-cover transition-transform duration-1000 group-hover/slide:scale-105"
                                                        priority={idx === 0}
                                                    />
                                                    <div className="absolute inset-0"
                                                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 55%, rgba(0,0,0,0.15) 100%)" }} />
                                                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10 max-w-[82%]">
                                                        <span style={{ display: "inline-block", background: "#e55a00", color: "#fff", fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", padding: "3px 12px", borderRadius: "2px", marginBottom: "10px", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(229,90,0,0.4)" }}>
                                                            Featured Premiere
                                                        </span>
                                                        <h2 style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "clamp(1.4rem,4vw,3.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "10px", textShadow: "0 2px 20px rgba(0,0,0,1)" }}>
                                                            {movie.name}
                                                        </h2>
                                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                                                            <span style={{ color: "#f5d78e", fontWeight: 800, fontSize: "clamp(0.8rem,1.5vw,1.1rem)" }}>★ {movie.rating || "8.5"}</span>
                                                            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{movie.year}</span>
                                                            <span style={{ border: "1.5px solid #d4a017", color: "#f5d78e", fontSize: "9px", fontWeight: 900, letterSpacing: "0.2em", padding: "2px 10px", borderRadius: "2px", textTransform: "uppercase" }}>
                                                                {movie.genre?.[0] || "Blockbuster"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                    {/* Stage gold line */}
                    <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#d4a017 30%,#d4a017 70%,transparent)", opacity: 0.35, marginTop: "2px" }} />
                </div>
            </div>

            {/* ══ AUDIENCE + SEATS ══ */}
            <div className="absolute left-0 right-0 bottom-0 z-50 pointer-events-none" style={{ height: "270px" }}>
                <AudienceSection />
            </div>

            {/* ══ SEARCH BAR ══ */}
            <div className="absolute left-1/2 z-[60] w-full px-4"
                style={{ bottom: "228px", transform: "translateX(-50%)", maxWidth: "680px" }}>
                <TheaterSearch />
                <p style={{ textAlign: "center", color: "rgba(212,160,23,0.28)", fontSize: "9px", fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", marginTop: "12px", fontFamily: "'Georgia',serif" }}>
                    Sit Back &amp; Enjoy the Show
                </p>
            </div>

            <style jsx>{`
                @keyframes screen-in {
                    from { opacity:0; transform:translateY(28px) scale(0.96); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                .animate-screen-in { animation: screen-in 1.4s cubic-bezier(0.16,1,0.3,1) forwards; }
                .cinema-theater { perspective: 2400px; }
            `}</style>
        </div>
    );
}