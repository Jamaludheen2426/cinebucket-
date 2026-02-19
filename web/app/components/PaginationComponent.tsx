"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
interface PaginationComponentProps {
  currentPage: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  searchQuery?: string;
}

export default function PaginationComponent({
  currentPage,
  totalPages = 10,
  onPageChange,
  basePath,
  searchQuery
}: PaginationComponentProps) {

  const CategoryPagination = (pageNumber: number): string => {
    if (basePath) {
      if (pageNumber === 1) {
        const categoryPath = basePath.replace('/page', ''); // Remove /page from basePath
        return searchQuery ? `${categoryPath}?query=${searchQuery}` : categoryPath;
      }
      const url = `${basePath}/${pageNumber}`;
      return searchQuery ? `${url}?query=${searchQuery}` : url;
    }
    return `/${pageNumber}${searchQuery ? `?query=${searchQuery}` : ''}`;
  }

  const constructPageUrl = (pageNumber: number): string => {
    if (basePath) {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);

      return `${basePath}?page=${pageNumber}${params.toString() ? `&${params.toString()}` : ''}`;
    }

    return `/page/${pageNumber}${searchQuery ? `?query=${searchQuery}` : ''}`;
  };

  const getPageUrl = (pageNumber: number): string => {
    if (basePath?.includes("category")) {
      return CategoryPagination(pageNumber);
    }
    return constructPageUrl(pageNumber);
  };

  const prevPageUrl = currentPage > 1 ? getPageUrl(currentPage - 1) : "#";
  const nextPageUrl = currentPage < totalPages ? getPageUrl(currentPage + 1) : "#";

  const activePageClass =
    "bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-md px-4 py-2 font-bold shadow-lg shadow-orange-500/20 transition-all duration-300 scale-105";
  const inactivePageClass =
    "bg-gray-800/40 backdrop-blur-md text-white hover:bg-yellow-400 hover:text-black hover:scale-105 rounded-md px-4 py-2 transition-all duration-300 border border-gray-700/50";

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number(modalInput);
    if (page && page > 0 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else if (basePath?.includes("category")) {
        const categoryPageUrl = CategoryPagination(page);
        router.push(categoryPageUrl);
      } else if (basePath && basePath.startsWith("/results")) {
        router.push(constructPageUrl(page));
      } else {
        router.push(constructPageUrl(page));
      }
      setModalOpen(false);
      setModalInput("");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalInput("");
  };

  return (
    <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-4 py-8">
      <Pagination className="flex flex-wrap justify-center w-full max-w-full overflow-x-auto">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationPrevious
              href={onPageChange ? "#" : prevPageUrl}
              onClick={(e) => {
                if (onPageChange && currentPage > 1) {
                  e.preventDefault(); onPageChange(currentPage - 1);
                } else if (currentPage <= 1) {
                  e.preventDefault();
                }
              }}
              className={`${inactivePageClass} ${currentPage <= 1 && !onPageChange ? "pointer-events-none opacity-30" : ""}`}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={onPageChange ? "#" : getPageUrl(pageNum)}
                    onClick={(e) => {
                      if (onPageChange) {
                        e.preventDefault();
                        onPageChange(pageNum);
                      }
                    }}
                    isActive={currentPage === pageNum}
                    className={currentPage === pageNum ? activePageClass : inactivePageClass}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <PaginationItem key={`ellipsis-${pageNum}`}>
                  <PaginationEllipsis
                    className={`${inactivePageClass} cursor-pointer hover:bg-gray-700`}
                    onClick={() => setModalOpen(true)}
                  />
                </PaginationItem>
              );
            }
            return null;
          })}

          <PaginationItem>
            <PaginationNext
              href={onPageChange ? "#" : nextPageUrl}
              onClick={(e) => {
                if (onPageChange && currentPage < totalPages) {
                  e.preventDefault(); onPageChange(currentPage + 1);
                } else if (currentPage >= totalPages && !onPageChange) {
                  e.preventDefault();
                }
              }}
              className={`${inactivePageClass} ${currentPage >= totalPages && !onPageChange ? "pointer-events-none opacity-30" : ""}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-2"
          onClick={handleModalClose}
        >
          <div
            className="bg-[#232323] rounded-lg p-4 sm:p-6 w-full max-w-xs sm:min-w-[260px] flex flex-col items-center gap-4 shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-blue-400 text-base">Go to</span>
            <form onSubmit={handleGoToPage} className="flex items-center gap-2 w-full justify-center">
              <input
                value={modalInput}
                onChange={e => setModalInput(e.target.value)}
                type="number"
                min={1}
                max={totalPages}
                autoFocus
                className="w-16 h-9 rounded-md bg-transparent border border-gray-600 text-white px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-white text-base">page</span>
              <button
                type="submit"
                className="ml-2 px-3 py-1 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                Go
              </button>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={handleModalClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}