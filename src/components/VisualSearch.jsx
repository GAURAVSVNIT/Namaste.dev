'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

export default function VisualSearch({ onResults }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  console.log('VisualSearch component rendered');

  const handleImageChange = (e) => {
    console.log('File upload triggered');
    const file = e.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please select an image under 10MB');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      console.log('Image set successfully');
    } else {
      console.log('No file selected');
    }
  };

  const handleSearch = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      console.log('Sending visual search request...');
      const response = await fetch('/api/visual-search', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        onResults(result.data.products);
        console.log('Found products:', result.data.products.length);
        console.log('Detected labels:', result.data.labels);
      } else {
        setError(result.error || 'Search failed');
        console.error('Search failed:', result.error);
      }
    } catch (err) {
      setError('An error occurred while searching.');
      console.error('Network error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to check API status
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/visual-search');
      const status = await response.json();
      console.log('API Status:', status);
    } catch (err) {
      console.error('Failed to check API status:', err);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

return (
    <div>
      <h3 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          margin: '0 0 1.25rem 0',
          fontSize: '0.95rem',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#ff4d6d'
        }}
      >
        <span>
          Visual Search
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </h3>
    
      {isExpanded && (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1rem',
          border: '1px solid rgba(255, 77, 109, 0.1)',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(255, 77, 109, 0.1)'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6c757d', 
            marginBottom: '1rem', 
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Upload an image to find similar products
          </p>
      
          {imagePreview ? (
            <div style={{ 
              marginBottom: '1rem', 
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 77, 109, 0.1)'
            }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <br />
              <button 
                onClick={clearImage}
                style={{ 
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Clear Image
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: 'rgba(248, 250, 252, 0.9)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 auto',
                  border: '2px dashed rgba(255, 77, 109, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6c757d',
                  transition: 'all 0.3s ease',
                  gap: '0.5rem'
                }}
                onClick={() => {
                  document.getElementById('visual-search-input')?.click();
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#ff4d6d';
                  e.target.style.backgroundColor = 'rgba(255, 77, 109, 0.05)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'rgba(255, 77, 109, 0.3)';
                  e.target.style.backgroundColor = 'rgba(248, 250, 252, 0.9)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <Upload size={24} color="#ff4d6d" />
                <span>Click to Upload</span>
                <span style={{ fontSize: '0.625rem', opacity: '0.7' }}>JPG, PNG, GIF</span>
              </div>
              
              <input
                id="visual-search-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          )}

          <button 
            onClick={handleSearch} 
            disabled={!image || isLoading}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: (!image || isLoading) ? '#d1d5db' : 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: (!image || isLoading) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              width: '100%',
              marginBottom: '0.75rem',
              transition: 'all 0.3s ease',
              boxShadow: (!image || isLoading) ? 'none' : '0 4px 12px rgba(255, 77, 109, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }}
            onMouseOver={(e) => {
              if (!(!image || isLoading)) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 77, 109, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!(!image || isLoading)) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite'
                }}></span>
                Searching...
              </span>
            ) : 'Search Similar Products'}
          </button>
          
          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '0.75rem', 
              textAlign: 'center',
              padding: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.375rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
