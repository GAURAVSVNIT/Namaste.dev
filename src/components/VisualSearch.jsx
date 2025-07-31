'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

export default function VisualSearch({ onResults }) {
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
    <div style={{ 
      padding: '16px', 
      border: '2px dashed #ccc', 
      borderRadius: '8px', 
      textAlign: 'center',
      backgroundColor: 'white',
      margin: '10px 0'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Visual Search TEST</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Upload an image to find similar products.</p>
      
      {imagePreview ? (
        <div style={{ marginBottom: '16px' }}>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ width: '128px', height: '128px', objectFit: 'cover', borderRadius: '8px' }} 
          />
          <br />
          <button 
            onClick={clearImage}
            style={{ 
              marginTop: '8px',
              padding: '4px 8px', 
              backgroundColor: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <div 
            style={{
              width: '128px',
              height: '128px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              margin: '0 auto 8px',
              border: '1px solid #ddd'
            }}
            onClick={() => {
              console.log('Upload area clicked');
              document.getElementById('simple-file-input')?.click();
            }}
          >
            📷 Click to Upload
          </div>
          
          <input
            id="simple-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ margin: '8px 0' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={handleSearch} 
          disabled={!image || isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: (!image || isLoading) ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!image || isLoading) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Searching...' : 'Search with Image'}
        </button>
        
        <button 
          onClick={checkApiStatus}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f9fafb',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Status
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
    </div>
  );
}
