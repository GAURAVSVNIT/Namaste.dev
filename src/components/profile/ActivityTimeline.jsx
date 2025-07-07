'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, FileText, Calendar, Activity as ActivityIcon } from 'lucide-react';
import Link from 'next/link';

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'liked':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'created':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'updated':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'liked':
        return 'liked';
      case 'created':
        return 'created';
      case 'updated':
        return 'updated';
      default:
        return 'performed an action on';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'liked':
        return 'bg-red-100 text-red-800';
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(timestamp?.seconds * 1000 || timestamp);
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-4 p-4 border-l-2 border-gray-100">
      <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
        {getIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className={`text-xs ${getTypeColor(activity.type)}`}>
            {activity.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(activity.timestamp)}
          </span>
        </div>
        
        <p className="text-sm">
          You {getActionText(activity.type)}{' '}
          {activity.blogTitle ? (
            <Link 
              href={`/blog/${activity.blogSlug || activity.blogId}`}
              className="font-medium text-primary hover:underline"
            >
              "{activity.blogTitle}"
            </Link>
          ) : (
            <span className="font-medium">a blog post</span>
          )}
        </p>
        
        {activity.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function ActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ActivityIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
        <p className="text-gray-500 mb-4">
          Your activities will appear here as you interact with blogs.
        </p>
        <Link href="/blog">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Explore Blogs
          </button>
        </Link>
      </div>
    );
  }

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = a.timestamp instanceof Date 
      ? a.timestamp 
      : new Date(a.timestamp?.seconds * 1000 || a.timestamp);
    const dateB = b.timestamp instanceof Date 
      ? b.timestamp 
      : new Date(b.timestamp?.seconds * 1000 || b.timestamp);
    return dateB - dateA;
  });

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Badge variant="secondary" className="ml-auto">
          {activities.length}
        </Badge>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedActivities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
