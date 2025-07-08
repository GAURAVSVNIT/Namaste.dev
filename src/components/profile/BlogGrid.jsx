'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogGrid({ blogs = [], loading = false, emptyMessage = "No blogs found" }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Blogs Yet</h3>
        <p className="text-gray-500 mb-4">{emptyMessage}</p>
        <Link href="/blog">
          <Button>Explore Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <Card key={blog.id} className="hover:shadow-lg transition-shadow">
          {blog.imageUrl && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img 
                src={blog.imageUrl} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">
                <Link href={`/blog/${blog.slug || blog.id}`} className="hover:text-primary">
                  {blog.title}
                </Link>
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {blog.createdAt instanceof Date 
                  ? blog.createdAt.toLocaleDateString()
                  : new Date(blog.createdAt?.seconds * 1000 || blog.createdAt).toLocaleDateString()
                }
              </span>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {blog.content || blog.description || 'No description available'}
            </p>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {blog.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{blog.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{blog.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{blog.comments || 0}</span>
                </div>
              </div>
              
              <Button size="sm" variant="ghost">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
