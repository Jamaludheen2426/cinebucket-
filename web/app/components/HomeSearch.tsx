"use client";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { useState, useEffect } from "react";
import { FunnelPlus, Search } from "lucide-react";
import React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import MainWrapper from "./MainWrapper";
import fetchAllMovies from "../lib/fetchAllMovies";
import { MovieDetails } from "../types/movie";
import { useRouter } from "next/navigation";
type Checked = DropdownMenuCheckboxItemProps["checked"];

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function HomeSearch({ placeholder = "Say Something" }: { placeholder?: string }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const genreOptions = [
        { key: 'action', label: 'Action' },
        { key: 'comedy', label: 'Comedy' },
        { key: 'drama', label: 'Drama' },
        { key: 'horror', label: 'Horror' },
        { key: 'sci-fi', label: 'Sci-Fi' },
    ];
    const yearOptions = [
        { key: '2024', label: '2024' },
        { key: '2023', label: '2023' },
        { key: '2022', label: '2022' },
        { key: '2021', label: '2021' },
        { key: '2020', label: '2020' },
    ];
    const tagOptions = [
        { key: 'popular', label: 'Popular' },
        { key: 'new-release', label: 'New Release' },
        { key: 'classic', label: 'Classic' },
        { key: 'award-winning', label: 'Award Winning' },
    ];

    const toggleDropdown = () => setIsDropdownOpen((open) => !open);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 3000); // 3000ms (3 seconds) debounce delay
    const router = useRouter();

    const buildFilterQueryString = () => {
        const filters = [];

        if (selectedGenre) {
            filters.push(`genre=${encodeURIComponent(selectedGenre)}`);
        }

        if (selectedYear) {
            filters.push(`year=${encodeURIComponent(selectedYear)}`);
        }

        if (selectedTag) {
            filters.push(`tag=${encodeURIComponent(selectedTag)}`);
        }

        return filters.length > 0 ? `&${filters.join('&')}` : '';
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            console.log(`%c[${new Date().toLocaleTimeString()}] IMMEDIATE SEARCH: "${searchTerm}"${buildFilterQueryString()}`, 'background: #ff5722; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            router.push(`/results?search_query=${encodeURIComponent(searchTerm)}${buildFilterQueryString()}`);
        } else if (selectedGenre || selectedYear || selectedTag) {
            console.log(`%c[${new Date().toLocaleTimeString()}] FILTER SEARCH: ${buildFilterQueryString()}`, 'background: #ff5722; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            router.push(`/results?${buildFilterQueryString().substring(1)}`);
        }
    };

    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            console.log(`%c[${new Date().toLocaleTimeString()}] DEBOUNCED SEARCH (after 3s delay): "${debouncedSearchTerm}"${buildFilterQueryString()}`, 'background: #4caf50; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            router.push(`/results?search_query=${encodeURIComponent(debouncedSearchTerm)}${buildFilterQueryString()}`);
        }
    }, [debouncedSearchTerm, selectedGenre, selectedYear, selectedTag, router]);

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            <div className="flex flex-row gap-4 items-center justify-center w-full">
                <div className="flex bg-[#1e2939]/50 p-3 w-full rounded-xl items-center border border-gray-700/50 backdrop-blur-sm transition-colors">
                    <input
                        type="text"
                        className="bg-transparent mx-3 outline-none text-gray-200 placeholder:text-gray-500 w-full"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={e => {
                            const newValue = e.target.value;
                            console.log(`%c[${new Date().toLocaleTimeString()}] Input changed: "${newValue}"`, 'color: #2196f3;');
                            setSearchTerm(newValue);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                    />
                    <button
                        className="flex items-center justify-center bg-[#232f3e] hover:bg-[#2a3a4d] text-[#fcfeff] font-medium rounded-lg px-4 py-1.5 ml-2 transition-colors shadow-lg"
                        onClick={toggleDropdown}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fcfeff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-1 sm:mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <line x1="4" y1="5" x2="16" y2="5" />
                            <line x1="4" y1="12" x2="10" y2="12" />
                            <line x1="14" y1="12" x2="20" y2="12" />
                            <line x1="8" y1="19" x2="20" y2="19" />
                            <circle cx="18" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="6" cy="19" r="2" />
                        </svg>
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>
            {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 w-full">
                    <div className="w-full max-w-full bg-[#1e2939] border border-gray-700 text-[#fcfeff] rounded-xl shadow-2xl p-0 overflow-hidden">
                        <div className="px-4 py-6 flex flex-col gap-4 sm:flex-row sm:gap-8 justify-center bg-[#1e2939]">
                            <div className="flex flex-col items-start w-full sm:min-w-[160px] sm:w-auto">
                                <div className="font-bold text-[#fcfeff] mb-2 text-sm uppercase tracking-wider opacity-80">Genre</div>
                                <select
                                    value={selectedGenre}
                                    onChange={e => setSelectedGenre(e.target.value)}
                                    className="w-full bg-[#2a3a4d] text-[#fcfeff] border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                                >
                                    <option value="">Select Genre</option>
                                    {genreOptions.map(option => (
                                        <option key={option.key} value={option.key}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col items-start w-full sm:min-w-[160px] sm:w-auto">
                                <div className="font-bold text-[#fcfeff] mb-2 text-sm uppercase tracking-wider opacity-80">Year</div>
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(e.target.value)}
                                    className="w-full bg-[#2a3a4d] text-[#fcfeff] border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                                >
                                    <option value="">Select Year</option>
                                    {yearOptions.map(option => (
                                        <option key={option.key} value={option.key}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col items-start w-full sm:min-w-[160px] sm:w-auto">
                                <div className="font-bold text-[#fcfeff] mb-2 text-sm uppercase tracking-wider opacity-80">Tag</div>
                                <select
                                    value={selectedTag}
                                    onChange={e => setSelectedTag(e.target.value)}
                                    className="w-full bg-[#2a3a4d] text-[#fcfeff] border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                                >
                                    <option value="">Select Tag</option>
                                    {tagOptions.map(option => (
                                        <option key={option.key} value={option.key}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="px-4 pb-6 flex bg-[#1e2939]">
                            <button
                                className="w-full sm:w-auto bg-[#fbbf24] hover:bg-yellow-500 text-black font-bold px-12 py-2.5 rounded-lg mx-auto transition-all transform active:scale-95 shadow-lg"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
