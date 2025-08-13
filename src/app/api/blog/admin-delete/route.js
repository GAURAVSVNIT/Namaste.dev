import { NextResponse } from 'next/server';
import { deleteBlog, getBlogById } from '@/lib/blog';
import { getUserProfile } from '@/lib/firebase';
import { USER_ROLES } from '@/lib/roles';

// DELETE - Admin delete a blog
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    const body = await request.json();
    const { adminId } = body;
    
    if (!blogId || !adminId) {
      return NextResponse.json(
        { error: 'Blog ID and Admin ID are required' },
        { status: 400 }
      );
    }
    
    // Check if the user is admin
    const userProfile = await getUserProfile(adminId);
    if (!userProfile || userProfile.role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Check if the blog exists
    const existingBlog = await getBlogById(blogId);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Admin can delete any blog
    await deleteBlog(blogId);
    
    return NextResponse.json({ 
      message: 'Blog deleted successfully by admin',
      deletedBlogId: blogId
    });
  } catch (error) {
    console.error('Error in admin delete blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
