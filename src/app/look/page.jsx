'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllLooks, deleteLook, MOODS } from '@/lib/look';
import LookCard from '@/components/look/LookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [looks, setLooks] = useState([]);
  const [filteredLooks, setFilteredLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        setIsLoading(true);
        const looksData = await getAllLooks();
        setLooks(looksData);
        setFilteredLooks(looksData);
        
        // Extract all unique tags
        const tags = new Set();
        looksData.forEach(look => {
          if (look.tags) {
            look.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load looks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLooks();
  }, []);

  // Filter and sort looks
  useEffect(() => {
    let filtered = [...looks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(look => 
        look.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (look.tags && look.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Mood filter
    if (selectedMood) {
      filtered = filtered.filter(look => look.mood === selectedMood);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(look => look.tags && look.tags.includes(selectedTag));
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        break;
      case 'comments':
        filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
      default:
        break;
    }

    setFilteredLooks(filtered);
  }, [looks, searchTerm, selectedMood, selectedTag, sortBy]);

  const handleEditLook = (look) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to edit looks.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to edit page - you'll need to create this route
    router.push(`/look/edit/${look.id}`);
  };

  const handleDeleteLook = async (lookId) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to delete looks.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this look?')) {
      return;
    }

    try {
      await deleteLook(lookId, user.uid);
      setLooks(prev => prev.filter(look => look.id !== lookId));
      toast({
        title: "Success",
        description: "Look deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete look. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMood('');
    setSelectedTag('');
    setSortBy('recent');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8" style={{ marginTop: '100px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Explore Looks</h1>
            <p className="text-gray-600 mt-2">
              Discover fashion inspirations from the community
            </p>
          </div>
          
          {user && (
            <Link href="/upload-look">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Look
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search looks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mood Filter */}
            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {MOODS.map(mood => (
                  <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Liked</SelectItem>
                <SelectItem value="comments">Most Comments</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                Search: {searchTerm} ×
              </Badge>
            )}
            {selectedMood && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedMood('')}>
                Mood: {selectedMood} ×
              </Badge>
            )}
            {selectedTag && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTag('')}>
                Tag: #{selectedTag} ×
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredLooks.length} look${filteredLooks.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Looks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          ) : filteredLooks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No looks found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
              {user && (
                <Link href="/upload-look">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Look
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredLooks.map((look) => (
              <LookCard 
                key={look.id} 
                look={look} 
                onEdit={handleEditLook}
                onDelete={handleDeleteLook}
              />
            ))
          )}
        </div>

        {/* Load More Button (for future pagination) */}
        {filteredLooks.length >= 20 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
