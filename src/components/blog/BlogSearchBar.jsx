'use client';

import React, { useState } from 'react';

const BlogSearchBar = ({ onSearch, placeholder = "Search blogs by title or tags..." }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Call the search callback with the query
    onSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto 32px auto'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Search Icon */}
        <svg
          style={{
            position: 'absolute',
            left: '16px',
            width: '20px',
            height: '20px',
            color: '#9ca3af',
            zIndex: 1
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 48px 12px 48px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            backgroundColor: '#ffffff',
            color: '#374151',
            outline: 'none',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            style={{
              position: 'absolute',
              right: '16px',
              width: '20px',
              height: '20px',
              border: 'none',
              background: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#9ca3af';
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default BlogSearchBar;
