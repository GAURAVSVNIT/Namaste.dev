'use client';

import BlogCard from './BlogCard';

const BlogList = ({ blogs, onEdit, onDelete, isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 0'
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

  if (!blogs || blogs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 0'
      }}>
        <div style={{
          color: '#6b7280',
          fontSize: '1.125rem',
          marginBottom: '16px'
        }}>
          No blogs found
        </div>
        <p style={{
          color: '#9ca3af',
          fontSize: '1rem'
        }}>
          Be the first to create a blog post!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      padding: '0 16px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        justifyItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }} className="blog-grid">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default BlogList;
