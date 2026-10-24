import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0
}: PaginationProps) {
  if (totalPages <= 1 && totalItems === 0) return null;

  // Logic hiển thị ellipsis
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-slate-400">
            ...
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={`page-${page}`}
          onClick={() => onPageChange(page as number)}
          className={`relative inline-flex items-center justify-center w-8 h-8 rounded-[12px] text-[13px] cursor-pointer font-bold transition-all ${isCurrent
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-center px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-[32px]">
      {totalPages > 1 && (
        <nav className="relative z-0 inline-flex items-center gap-1.5" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-[12px] bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-4 w-4" />
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-[12px] bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
