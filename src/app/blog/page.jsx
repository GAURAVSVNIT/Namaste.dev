'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase';
import BlogList from '@/components/blog/BlogList';
import BlogForm from '@/components/blog/BlogForm';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import SplitText from '@/blocks/TextAnimations/SplitText/SplitText';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default: 3 per row × 4 rows
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading: authLoading } = useAuth();

  // Fetch user profile when user is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          // Error fetching user profile - continue without profile
        }
      }
    };

    fetchUserProfile();
  }, [user]);

// Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setItemsPerPage(4); // Mobile: 1 per row × 4 rows = 4 items
      } else if (width <= 1024) {
        setItemsPerPage(8); // Tablet: 2 per row × 4 rows = 8 items
      } else {
        setItemsPerPage(12); // Desktop: 3 per row × 4 rows = 12 items
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of blogs section
    document.getElementById('blogs-section')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blog');
      if (response.ok) {
        const blogsData = await response.json();
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
      } else {
        // Failed to fetch blogs
      }
    } catch (error) {
      // Error fetching blogs
    } finally {
      setIsLoading(false);
    }
  };

  // Handle blog search
  const handleSearch = (query) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setFilteredBlogs(blogs);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = blogs.filter(blog => {
      const titleMatch = blog.title?.toLowerCase().includes(lowercaseQuery);
      const contentMatch = blog.content?.toLowerCase().includes(lowercaseQuery);
      const tagsMatch = blog.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      return titleMatch || contentMatch || tagsMatch;
    });
    
    setFilteredBlogs(filtered);
  };

  useEffect(() => {
    fetchBlogs();
    
    // Check for edit parameter and localStorage data
    const urlParams = new URLSearchParams(window.location.search);
    const shouldEdit = urlParams.get('edit');
    
    if (shouldEdit === 'true') {
      const editingBlogData = localStorage.getItem('editingBlog');
      if (editingBlogData) {
        try {
          const blogData = JSON.parse(editingBlogData);
          setEditingBlog(blogData);
          setShowForm(true);
          // Clean up localStorage
          localStorage.removeItem('editingBlog');
          // Clean up URL
          window.history.replaceState({}, document.title, '/blog');
        } catch (error) {
          console.error('Error parsing editing blog data:', error);
        }
      }
    }
  }, []);

  // Create blog
  const handleCreateBlog = async (blogData) => {
    if (!user || !userProfile) {
      alert('Please login to create a blog');
      return;
    }

    try {
      const authorName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email;
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blogData,
          authorId: user.uid,
          authorName: authorName
        }),
      });

      if (response.ok) {
        setShowForm(false);
        fetchBlogs(); // Refresh blogs
        alert('Blog created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create blog. Please try again.');
    }
  };

  // Update blog
  const handleUpdateBlog = async (blogData) => {
    if (!user || !editingBlog) return;

    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBlog.id,
          ...blogData,
          authorId: user.uid
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingBlog(null);
        fetchBlogs(); // Refresh blogs
        alert('Blog updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to update blog. Please try again.');
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog?id=${blogId}&authorId=${user.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBlogs(); // Refresh blogs
        alert('Blog deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete blog: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete blog. Please try again.');
    }
  };

  // Edit blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBlog(null);
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: '120px'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '48px',
          width: '48px',
          border: '3px solid #e5e7eb',
          borderBottomColor: '#3b82f6'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{
        paddingTop: '40px',
        paddingBottom: '80px',
        marginTop: '40px'
      }}>
        <div style={{
          width: '100%',
          paddingLeft: '8%',
          paddingRight: '8%'
        }}>
          {/* Hero Section */}
          <div style={{
            position: 'relative',
            textAlign: 'center',
            marginBottom: '80px',
            padding: '20px',
            height: '60vh',
            minHeight: '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--color-fashion-primary) 0%, var(--color-fashion-secondary) 100%)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3
            }}></div>
            
            {/* Floating Elements */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '10%',
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '15%',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 4s ease-in-out infinite reverse'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '20%',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 5s ease-in-out infinite'
            }}></div>
            
            <div style={{ 
              position: 'relative',
              zIndex: 2,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '8px 20px',
                borderRadius: '50px',
                marginBottom: '24px'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  fontWeight: '500'
                }}>✨ Welcome to Our Fashion Community</span>
              </div>
              
              <div style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: '24px',
                lineHeight: '1.1',
                textShadow: 'none',
                letterSpacing: '-0.02em'
              }}>
                <SplitText 
                  text="Fashion Blog" 
                  splitType="chars"
                  delay={80}
                  duration={0.8}
                  ease="power3.out"
                  from={{ opacity: 0, y: 60, rotateX: -90 }}
                  to={{ opacity: 1, y: 0, rotateX: 0 }}
                  threshold={0.2}
                  className="fashion-blog-split"
                />
              </div>
              
              <p style={{
                fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
                color: '#ffffff',
                margin: '0 auto',
                marginBottom: '40px',
                lineHeight: '1.6',
                maxWidth: '600px',
                textShadow: 'none'
              }}>
                Discover the latest trends, share your style insights, and connect with fashion enthusiasts worldwide
              </p>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginTop: '32px'
              }}>
                {user && !showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    style={{
background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: '#ffffff',
                      padding: '16px 32px',
                      borderRadius: '50px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                      boxShadow: '0 10px 20px rgba(100, 100, 100, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 15px 30px rgba(100, 100, 100, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 10px 20px rgba(100, 100, 100, 0.3)';
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 1 }}>✨ Create New Blog</span>
                  </button>
                )}
                
                {/* Explore Button - Always visible */}
                <button
                  onClick={() => {
                    document.querySelector('[data-blog-list]')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  🚀 Explore Blogs
                </button>
              </div>
            </div>
            
            {/* CSS Animations */}
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-20px);
                }
              }
              
              .fashion-blog-split {
                color: inherit !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
                text-shadow: inherit !important;
                letter-spacing: inherit !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .fashion-blog-subtitle {
                color: inherit !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
                text-shadow: inherit !important;
                letter-spacing: inherit !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            `}</style>
          </div>

          {/* Show form if creating/editing */}
          {showForm && (
            <div style={{
              marginBottom: '48px',
              padding: '0 16px'
            }}>
              <BlogForm
                onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog}
                onCancel={handleCancelForm}
                initialData={editingBlog}
              />
            </div>
          )}

          {/* Blog List */}
          {!showForm && (
            <div 
              id="blogs-section"
              data-blog-list
              style={{
                marginTop: '48px',
                scrollMarginTop: '100px'
              }}
            >
              {/* Search Bar */}
              <div style={{
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <BlogSearchBar onSearch={handleSearch} />
              </div>
              
              <BlogList
                blogs={currentBlogs}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
                isLoading={isLoading}
              />

              {/* Pagination Controls */}
              {!isLoading && filteredBlogs.length > 0 && totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '40px'
                }}>
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: currentPage === 1 ? '#f8f9fa' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: currentPage === 1 ? '#cbd5e0' : 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(255, 77, 109, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(255, 77, 109, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.25)';
                      }
                    }}
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = page === 1 || 
                                    page === totalPages || 
                                    (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            style={{
                              padding: '12px 8px',
                              color: '#cbd5e0',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: 'none',
                        background: currentPage === page 
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                            : '#ffffff',
                          color: currentPage === page ? 'white' : '#6b7280',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: currentPage === page ? 'none' : '2px solid #e5e7eb',
                          boxShadow: currentPage === page 
                            ? '0 4px 12px rgba(255, 77, 109, 0.25)'
                            : '0 2px 8px rgba(0, 0, 0, 0.06)',
                          minWidth: '44px'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== page) {
                            e.target.style.background = 'linear-gradient(135deg, rgba(255, 77, 109, 0.1) 0%, rgba(255, 117, 143, 0.1) 100%)';
                            e.target.style.borderColor = 'var(--color-fashion-primary)';
                            e.target.style.color = 'var(--color-fashion-primary)';
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== page) {
                            e.target.style.background = '#ffffff';
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.color = '#6b7280';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: currentPage === totalPages ? '#f8f9fa' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: currentPage === totalPages ? '#cbd5e0' : 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(255, 77, 109, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(255, 77, 109, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 109, 0.25)';
                      }
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              {!isLoading && filteredBlogs.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '30px',
                  color: '#718096',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} blogs
                  {totalPages > 1 && (
                    <span style={{ margin: '0 8px', color: '#cbd5e0' }}>•</span>
                  )}
                  {totalPages > 1 && `Page ${currentPage} of ${totalPages}`}
                </div>
              )}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!user && !authLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 0',
              marginTop: '48px'
            }}>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                padding: '32px',
                maxWidth: '448px',
                width: '100%',
                margin: '0 16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px'
                  }}>
                    Join Our Community
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '32px',
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    lineHeight: '1.6'
                  }}>
                    Create and share your own fashion blog posts with our community!
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <a 
                      href="/auth/login"
                      style={{
                        display: 'block',
                        width: '100%',
                        backgroundColor: 'var(--color-fashion-primary)',
                        color: '#ffffff',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        border: 'none'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'var(--color-fashion-secondary)';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'var(--color-fashion-primary)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      Login
                    </a>
                    <a 
                      href="/auth/signup"
                      style={{
                        display: 'block',
                        width: '100%',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        border: '1px solid #d1d5db',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#e5e7eb';
                        e.target.style.borderColor = '#9ca3af';
                        e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Sign Up
                    </a>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginTop: '24px'
                  }}>
                    Already have an account? Just login to start creating!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
