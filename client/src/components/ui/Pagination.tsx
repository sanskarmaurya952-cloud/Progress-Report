import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages.map((page, index) => {
      if (typeof page === 'string') {
        return (
          <span
            key={`ellipsis-${index}`}
            className="px-2 py-1 text-sm text-uplivo-text-muted select-none"
          >
            ...
          </span>
        );
      }

      const isActive = page === currentPage;
      return (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center ${
            isActive
              ? 'bg-uplivo-primary text-white shadow-sm shadow-uplivo-primary/20'
              : 'text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-surface'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-1.5 rounded-lg text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {renderPageNumbers()}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded-lg text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
