import { NextResponse } from 'next/server';
import { createBlog, getAllBlogs, getBlogs, updateBlog, deleteBlog, getBlogById } from '@/lib/blog';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase';
import { USER_ROLES } from '@/lib/roles';

// GET - Fetch blogs with optional pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    const pageSize = parseInt(searchParams.get('pageSize')) || null;
    const lastVisible = searchParams.get('lastVisible') || null;
    
    if (blogId) {
      const blog = await getBlogById(blogId);
      if (!blog) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      return NextResponse.json(blog);
    }
    
    // If pageSize is provided, use pagination
    if (pageSize) {
      const result = await getBlogs(pageSize, lastVisible);
      return NextResponse.json(result);
    }
    
    // Fallback to get all blogs
    const blogs = await getAllBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, tags, imageUrl, authorId, authorName } = body;
    
    if (!title || !content || !authorId || !authorName) {
      return NextResponse.json(
        { error: 'Title, content, authorId, and authorName are required' },
        { status: 400 }
      );
    }
    
    const blogData = {
      title,
      content,
      tags: tags || [],
      imageUrl: imageUrl || ''
    };
    
    const newBlog = await createBlog(blogData, authorId, authorName);
    
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

// PUT - Update a blog
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, content, tags, imageUrl, authorId } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the blog exists and if the user is the author
    const existingBlog = await getBlogById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    if (existingBlog.authorId !== authorId) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this blog' },
        { status: 403 }
      );
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    const updatedBlog = await updateBlog(id, updateData);
    
    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    const authorId = searchParams.get('authorId');
    
    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the blog exists and if the user is the author
    const existingBlog = await getBlogById(blogId);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    if (existingBlog.authorId !== authorId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this blog' },
        { status: 403 }
      );
    }
    
    await deleteBlog(blogId);
    
    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
