'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/user';
import { toggleLikeLook } from '@/lib/look';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SmartAvatar from '@/components/ui/smart-avatar';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LookCard({ look, onEdit, onDelete }) {
  const { user } = useAuth();
  const [author, setAuthor] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(look.likes?.length || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load author information
    const loadAuthor = async () => {
      try {
        const userData = await getUserById(look.userId);
        setAuthor(userData);
      } catch (error) {
        // Error loading author - will show fallback
      }
    };

    loadAuthor();

    // Check if current user liked this look
    if (user && look.likes) {
      setIsLiked(look.likes.includes(user.uid));
    }
  }, [look.userId, look.likes, user]);

  const handleLike = async () => {
    if (!user) {
      // User must be logged in to like looks
      return;
    }

    setLoading(true);
    try {
      const result = await toggleLikeLook(look.id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      // Error toggling like - could add toast notification here if needed
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && user.uid === look.userId;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Main Image */}
        <div className="aspect-square relative overflow-hidden">
          <Link href={`/look/${look.id}`}>
            <img
              src={look.images?.[0] || '/placeholder-image.jpg'}
              alt={look.caption}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </Link>
          
          {/* Mood Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/80 text-black">
              {look.mood}
            </Badge>
          </div>

          {/* Multiple Images Indicator & Edit Menu */}
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            {look.images.length > 1 && (
              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                1/{look.images.length}
              </div>
            )}
            
            {/* Edit Menu */}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => onEdit(look)} className="hover:bg-gray-100 focus:bg-gray-100">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(look.id)}
                    className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <SmartAvatar 
                user={author} 
                className="w-8 h-8"
                fallbackClassName="text-xs"
              />
              <div>
                <p className="font-medium text-sm">{author?.name || 'Unknown User'}</p>
                <p className="text-xs text-muted-foreground">{formatDate(look.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Caption */}
          <Link href={`/look/${look.id}`}>
            <p className="text-sm text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-gray-700">
              {look.caption}
            </p>
          </Link>

          {/* Tags */}
          {look.tags && look.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {look.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {look.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{look.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-1 text-sm">{likesCount}</span>
              </Button>
              
              <Link href={`/look/${look.id}`}>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-500 hover:text-gray-700">
                  <MessageCircle className="h-5 w-5" />
                  <span className="ml-1 text-sm">{look.comments?.length || 0}</span>
                </Button>
              </Link>
            </div>

            <Link href={`/look/${look.id}`}>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
