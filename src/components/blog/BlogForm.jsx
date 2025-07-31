'use client';

import { useState } from 'react';

const BlogForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags?.join(', ') || '',
    imageUrl: initialData?.imageUrl || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        imageUrl: formData.imageUrl.trim()
      };
      
      await onSubmit(blogData);
    } catch (error) {
      console.error('Error submitting blog:', error);
      alert('Failed to save blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      {/* Form Container with Glass Effect */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '50%',
          transform: 'rotate(45deg)'
        }}></div>
        
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Icon Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            marginBottom: '20px',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{
              fontSize: '2rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>✍️</span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            {initialData ? 'Edit Your Story' : 'Craft Your Story'}
          </h2>
          
          <p style={{
            color: '#6b7280',
            fontSize: '1.125rem',
            fontWeight: '400',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {initialData ? 'Perfect your blog post and share your updated insights' : 'Share your thoughts and inspire others with your unique perspective'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
          {/* Title Field */}
          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="title" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              letterSpacing: '0.025em'
            }}>
              ✨ Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter an engaging title..."
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#111827',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e5e7eb';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
              required
            />
          </div>
          
          {/* Two-column layout for Image URL and Tags */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                🖼️ Cover Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  color: '#111827',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e5e7eb';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                🏷️ Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="fashion, style, trends"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  color: '#111827',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e5e7eb';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '6px',
                fontStyle: 'italic'
              }}>
                Separate with commas for better discoverability
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div style={{ marginBottom: '40px' }}>
            <label htmlFor="content" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              letterSpacing: '0.025em'
            }}>
              📝 Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Tell your story... Share your insights, experiences, and thoughts that will inspire and engage your readers."
              rows={12}
              style={{
                width: '100%',
                padding: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#111827',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e5e7eb';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>
          
          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                padding: '14px 28px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                opacity: isSubmitting ? 0.6 : 1,
                minWidth: '120px'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '14px 28px',
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: isSubmitting 
                  ? '0 4px 10px rgba(156, 163, 175, 0.3)'
                  : '0 10px 25px rgba(102, 126, 234, 0.3)',
                minWidth: '140px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {initialData ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span>{initialData ? '✨ Update Blog' : '🚀 Publish Blog'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Loading Animation CSS */}
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

export default BlogForm;
