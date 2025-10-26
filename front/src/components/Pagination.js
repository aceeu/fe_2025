import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Показано {startItem}-{endItem} из {totalItems} записей
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &laquo; Назад
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination-button ${page === currentPage ? 'active' : ''} ${
              page === '...' ? 'ellipsis' : ''
            }`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Вперед &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
