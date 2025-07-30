'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase';
import BlogList from '@/components/blog/BlogList';
import BlogForm from '@/components/blog/BlogForm';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import Footer from '@/components/Footer';
import SplitText from '@/blocks/TextAnimations/SplitText/SplitText';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
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
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        marginTop: '100px'
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
            padding: '60px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
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
                textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 auto',
                marginBottom: '40px',
                lineHeight: '1.6',
                maxWidth: '600px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      color: '#ffffff',
                      padding: '16px 32px',
                      borderRadius: '50px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                      boxShadow: '0 10px 20px rgba(238, 90, 36, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 15px 30px rgba(238, 90, 36, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 10px 20px rgba(238, 90, 36, 0.3)';
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
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: '600',
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
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
                blogs={filteredBlogs}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
                isLoading={isLoading}
              />
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
                        backgroundColor: '#3b82f6',
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
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#3b82f6';
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
      <div style={{ marginTop: '4rem' }}>
        <Footer />
      </div>
    </div>
  );
};

export default BlogPage;
