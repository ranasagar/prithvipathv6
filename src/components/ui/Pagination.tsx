import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, label = "पृष्ठ" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label={label}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="अघिल्लो पृष्ठ"
      >
        <ChevronLeft size={18} />
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 font-bold">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`min-w-[2.5rem] h-10 rounded-xl font-bold text-sm transition-all ${
              page === currentPage
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white text-slate-600 border border-slate-100 hover:border-primary/20 hover:text-primary"
            }`}
            aria-label={`पृष्ठ ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="अर्को पृष्ठ"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
