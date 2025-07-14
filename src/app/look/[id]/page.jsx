'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLookById, toggleLikeLook, addCommentToLook, deleteCommentFromLook } from '@/lib/look';
import { getUserById } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import SmartAvatar from '@/components/ui/smart-avatar';
import { Heart, MessageCircle, Share2, ArrowLeft, Send, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [look, setLook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLook();
    }
  }, [id]);

  const fetchLook = async () => {
    try {
      setIsLoading(true);
      const lookData = await getLookById(id);
      setLook(lookData);
      setLikesCount(lookData.likes?.length || 0);
      setComments(lookData.comments || []);
      
      // Check if current user liked this look
      if (user && lookData.likes) {
        setIsLiked(lookData.likes.includes(user.uid));
      }

      // Load author information
      const authorData = await getUserById(lookData.userId);
      setAuthor(authorData);
    } catch (error) {
      console.error('Error fetching look:', error);
      toast({
        title: "Error",
        description: "Failed to load look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to like looks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await toggleLikeLook(id, user.uid);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!commentInput.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    try {
      const newComment = await addCommentToLook(id, user.uid, commentInput.trim());
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await deleteCommentFromLook(id, user.uid, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: look.caption,
          text: `Check out this look: ${look.caption}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Look not found</h1>
          <p className="text-gray-600 mb-4">The look you're looking for doesn't exist.</p>
          <Link href="/look">
            <Button>Browse Looks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img
                src={look.images[currentImageIndex]}
                alt={look.caption}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {look.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {look.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {look.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {look.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Author & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SmartAvatar 
                  user={author} 
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="font-semibold">{author?.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500">{formatDate(look.createdAt)}</p>
                </div>
              </div>
              
              {user && user.uid === look.userId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                    <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Caption */}
            <div>
              <p className="text-gray-900 whitespace-pre-wrap">{look.caption}</p>
            </div>

            {/* Mood & Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Mood:</span>
                <Badge variant="secondary">{look.mood}</Badge>
              </div>
              
              {look.tags && look.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {look.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Color Palette */}
            {look.colorPalette && look.colorPalette.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-gray-500">Color Palette:</span>
                <div className="flex gap-2">
                  {look.colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  isLiked ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-600"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </Button>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h4 className="font-semibold">Comments ({comments.length})</h4>
              
              {/* Comment Form */}
              {user && (
                <form onSubmit={handleComment} className="flex gap-2">
                  <Input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSubmittingComment || !commentInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-white rounded-lg">
                    <SmartAvatar 
                      user={{ uid: comment.userId }} 
                      className="w-8 h-8"
                      fallbackClassName="text-xs"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">User</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          {user && (user.uid === comment.userId || user.uid === look.userId) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 p-1 h-auto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
