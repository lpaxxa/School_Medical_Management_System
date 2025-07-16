import React from 'react';
import './CustomPagination.css';

const CustomPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showInfo = true,
  startIndex = 0,
  endIndex = 0,
  totalItems = 0,
  itemName = "items"
}) => {
  if (totalPages <= 1) return null;

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  return (
    <div className="custom-pagination-container">
      {showInfo && (
        <div className="pagination-info">
          <small className="text-muted">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} {itemName}
          </small>
        </div>
      )}
      
      <div className="custom-pagination">
        {/* First page button */}
        <button
          className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          title="First page"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>

        {/* Previous page button */}
        <button
          className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <i className="fas fa-angle-left"></i>
        </button>

        {/* Current page indicator */}
        <div className="pagination-current">
          {currentPage} / {totalPages}
        </div>

        {/* Next page button */}
        <button
          className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <i className="fas fa-angle-right"></i>
        </button>

        {/* Last page button */}
        <button
          className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
