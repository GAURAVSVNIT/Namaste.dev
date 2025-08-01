'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const MarketplacePagination = ({ 
  hasMore, 
  isLoading, 
  onLoadMore, 
  currentPage, 
  totalProducts 
}) => {
  if (!hasMore && currentPage === 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      padding: '48px 16px',
      marginTop: '32px'
    }}>
      {/* Current page info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <span>Page {currentPage}</span>
        {totalProducts > 0 && (
          <span style={{ color: '#9ca3af' }}>
            • Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalProducts)} of {totalProducts}
          </span>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isLoading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '50px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 77, 109, 0.3)',
            outline: 'none',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 8px 20px rgba(255, 77, 109, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.3)';
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Loading...
            </>
          ) : (
            <>
              Load More Products
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </>
          )}
        </button>
      )}

      {/* End message */}
      {!hasMore && currentPage > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 24px',
          backgroundColor: '#f9fafb',
          borderRadius: '50px',
          border: '1px solid #e5e7eb'
        }}>
          <span>🎉</span>
          <span>You've reached the end!</span>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplacePagination;
