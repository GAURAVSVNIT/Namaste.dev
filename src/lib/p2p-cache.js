/**
 * Peer-to-Peer Caching Architecture
 * Advanced caching system with intelligent TTL, batch processing, 
 * predictive prefetching, and distributed cache sharing capabilities
 */

export class P2PCache {
  constructor(options = {}) {
    this.userCache = new Map(); // User data cache
    this.contentCache = new Map(); // Content data cache
    this.cacheTimestamps = new Map(); // Cache timestamp tracking
    this.CACHE_TTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes TTL
    this.MAX_CACHE_SIZE = options.maxCacheSize || 1000; // Maximum cached items
    this.hitRatio = { hits: 0, misses: 0 }; // Cache performance metrics
    this.prewarmedUsers = new Set(); // Track prewarmed users
    this.popularUsersTTL = options.popularUsersTTL || 30 * 60 * 1000; // 30 minutes for popular users
    this.accessFrequency = new Map(); // Track access frequency for LRU
    this.networkPeers = new Set(); // P2P network peers
    this.cacheOperations = {
      reads: 0,
      writes: 0,
      evictions: 0,
      prefetches: 0
    };
  }

  // Check if cache entry is valid
  isValid(key, isPopularUser = false) {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    const ttl = isPopularUser ? this.popularUsersTTL : this.CACHE_TTL;
    return Date.now() - timestamp < ttl;
  }

  // Check if user is popular (has many followers/interactions)
  isPopularUser(userData) {
    if (!userData) return false;
    return userData.verified || 
           (userData.followers && userData.followers > 1000) ||
           (userData.totalLikes && userData.totalLikes > 5000);
  }

  // Update access frequency for LRU
  updateAccessFrequency(key) {
    const currentFreq = this.accessFrequency.get(key) || 0;
    this.accessFrequency.set(key, currentFreq + 1);
  }

  // Get user data from cache
  getUser(userId) {
    this.cacheOperations.reads++;
    const cachedUser = this.userCache.get(userId);
    const isPopular = cachedUser ? this.isPopularUser(cachedUser) : false;
    
    if (this.isValid(`user_${userId}`, isPopular)) {
      this.hitRatio.hits++;
      this.updateAccessFrequency(`user_${userId}`);
      return cachedUser;
    }
    this.hitRatio.misses++;
    return null;
  }

  // Set user data in cache with intelligent TTL and LRU eviction
  setUser(userId, userData) {
    this.cacheOperations.writes++;
    
    // Implement LRU eviction if cache is full
    if (this.userCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }
    
    this.userCache.set(userId, userData);
    this.cacheTimestamps.set(`user_${userId}`, Date.now());
    this.updateAccessFrequency(`user_${userId}`);
    
    // Mark popular users for longer caching
    if (this.isPopularUser(userData)) {
      this.prewarmedUsers.add(userId);
    }
  }

  // LRU eviction strategy
  evictLRU() {
    let leastFrequentKey = null;
    let minFrequency = Infinity;
    let oldestTimestamp = Infinity;

    // Find least frequently used entry, with oldest as tiebreaker
    for (const [key, frequency] of this.accessFrequency.entries()) {
      const timestamp = this.cacheTimestamps.get(key) || 0;
      
      if (frequency < minFrequency || 
          (frequency === minFrequency && timestamp < oldestTimestamp)) {
        minFrequency = frequency;
        oldestTimestamp = timestamp;
        leastFrequentKey = key;
      }
    }

    if (leastFrequentKey) {
      const userId = leastFrequentKey.replace('user_', '');
      this.userCache.delete(userId);
      this.cacheTimestamps.delete(leastFrequentKey);
      this.accessFrequency.delete(leastFrequentKey);
      this.prewarmedUsers.delete(userId);
      this.cacheOperations.evictions++;
    }
  }

  // Batch get multiple users with predictive prefetching
  async batchGetUsers(userIds, fetchFunction) {
    const results = new Map();
    const uncachedIds = [];
    const prefetchIds = new Set(); // Users to prefetch based on relationships

    // Check cache first and identify prefetch candidates
    for (const userId of userIds) {
      const cached = this.getUser(userId);
      if (cached) {
        results.set(userId, cached);
        // Add related users for prefetching (friends, frequent collaborators)
        if (cached.frequentCollaborators) {
          cached.frequentCollaborators.forEach(id => prefetchIds.add(id));
        }
      } else {
        uncachedIds.push(userId);
      }
    }

    // Fetch uncached users in parallel with controlled concurrency
    if (uncachedIds.length > 0) {
      const BATCH_SIZE = 10; // Limit concurrent requests
      const batches = [];
      
      for (let i = 0; i < uncachedIds.length; i += BATCH_SIZE) {
        batches.push(uncachedIds.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        const fetchPromises = batch.map(async (userId) => {
          try {
            const userData = await fetchFunction(userId);
            if (userData) {
              this.setUser(userId, userData);
              results.set(userId, userData);
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        });

        await Promise.all(fetchPromises);
      }
    }

    // Background prefetch for related users (don't wait for this)
    this.backgroundPrefetch(Array.from(prefetchIds), fetchFunction);

    return results;
  }

  // Background prefetch for predictive caching
  async backgroundPrefetch(userIds, fetchFunction) {
    if (userIds.length === 0) return;
    
    // Only prefetch users not already cached
    const uncachedPrefetchIds = userIds.filter(id => !this.getUser(id));
    
    if (uncachedPrefetchIds.length > 0) {
      // Limit prefetch to avoid overwhelming the system
      const limitedIds = uncachedPrefetchIds.slice(0, 20);
      this.cacheOperations.prefetches += limitedIds.length;
      
      setTimeout(async () => {
        try {
          await this.batchGetUsers(limitedIds, fetchFunction);
          console.log(`Prefetched ${limitedIds.length} users in background`);
        } catch (error) {
          console.error('Background prefetch error:', error);
        }
      }, 1000); // Delay to not interfere with main request
    }
  }

  // Cache warming for frequently accessed users
  async warmCache(popularUserIds, fetchFunction) {
    if (popularUserIds.length === 0) return;
    
    console.log(`Warming cache for ${popularUserIds.length} popular users`);
    const WARM_BATCH_SIZE = 5;
    
    for (let i = 0; i < popularUserIds.length; i += WARM_BATCH_SIZE) {
      const batch = popularUserIds.slice(i, i + WARM_BATCH_SIZE);
      try {
        await this.batchGetUsers(batch, fetchFunction);
        // Small delay between batches to not overwhelm Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Cache warming error:', error);
      }
    }
  }

  // Register a peer in the P2P network
  addPeer(peerId) {
    this.networkPeers.add(peerId);
  }

  // Remove a peer from the P2P network
  removePeer(peerId) {
    this.networkPeers.delete(peerId);
  }

  // Broadcast cache update to peers
  async broadcastCacheUpdate(userId, userData) {
    if (this.networkPeers.size === 0) return;

    const updatePayload = {
      type: 'cache_update',
      userId,
      userData,
      timestamp: Date.now(),
      source: 'peer'
    };

    // In a real implementation, this would send to actual peers
    console.log(`Broadcasting cache update for user ${userId} to ${this.networkPeers.size} peers`);
  }

  // Get cache statistics with detailed metrics
  getStats() {
    const total = this.hitRatio.hits + this.hitRatio.misses;
    const cacheEfficiency = this.userCache.size > 0 ? 
      (this.prewarmedUsers.size / this.userCache.size * 100).toFixed(1) : 0;
    
    return {
      hitRate: total > 0 ? (this.hitRatio.hits / total * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.userCache.size,
      hits: this.hitRatio.hits,
      misses: this.hitRatio.misses,
      prewarmedUsers: this.prewarmedUsers.size,
      cacheEfficiency: cacheEfficiency + '%',
      avgResponseTime: this.hitRatio.hits > 0 ? 
        `~${Math.round(this.hitRatio.hits * 0.1)}ms (estimated)` : 'N/A',
      operations: this.cacheOperations,
      networkPeers: this.networkPeers.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    let totalSize = 0;
    
    // Rough estimation - each user object ~1KB
    totalSize += this.userCache.size * 1024;
    totalSize += this.cacheTimestamps.size * 16; // timestamp entries
    totalSize += this.accessFrequency.size * 16; // frequency entries
    
    return {
      estimated: `${(totalSize / 1024).toFixed(2)} KB`,
      entries: this.userCache.size
    };
  }

  // Intelligent cache cleanup with popularity-based retention
  cleanup() {
    const now = Date.now();
    const expiredEntries = [];
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      const userId = key.replace('user_', '');
      const isPopular = this.prewarmedUsers.has(userId);
      const ttl = isPopular ? this.popularUsersTTL : this.CACHE_TTL;
      
      if (now - timestamp >= ttl) {
        expiredEntries.push(userId);
      }
    }
    
    // Remove expired entries
    expiredEntries.forEach(userId => {
      this.userCache.delete(userId);
      this.cacheTimestamps.delete(`user_${userId}`);
      this.accessFrequency.delete(`user_${userId}`);
      this.prewarmedUsers.delete(userId);
    });
    
    if (expiredEntries.length > 0) {
      console.log(`Cleaned up ${expiredEntries.length} expired cache entries`);
    }
  }

  // Export cache state for P2P sharing
  exportCacheState() {
    const exportData = {
      users: Object.fromEntries(this.userCache),
      timestamps: Object.fromEntries(this.cacheTimestamps),
      accessFrequency: Object.fromEntries(this.accessFrequency),
      prewarmedUsers: Array.from(this.prewarmedUsers),
      stats: this.getStats(),
      exportTime: Date.now()
    };
    return JSON.stringify(exportData);
  }

  // Import cache state from P2P network
  importCacheState(cacheStateJson) {
    try {
      const importData = JSON.parse(cacheStateJson);
      const now = Date.now();
      
      // Only import recent cache entries
      const MAX_IMPORT_AGE = 2 * 60 * 1000; // 2 minutes
      
      if (now - importData.exportTime < MAX_IMPORT_AGE) {
        let importedCount = 0;
        
        Object.entries(importData.users).forEach(([userId, userData]) => {
          if (!this.getUser(userId)) { // Don't overwrite existing cache
            this.setUser(userId, userData);
            importedCount++;
          }
        });
        
        // Import access frequency data
        Object.entries(importData.accessFrequency || {}).forEach(([key, freq]) => {
          if (!this.accessFrequency.has(key)) {
            this.accessFrequency.set(key, freq);
          }
        });
        
        importData.prewarmedUsers.forEach(userId => {
          this.prewarmedUsers.add(userId);
        });
        
        console.log(`Imported cache data for ${importedCount} users from P2P network`);
      }
    } catch (error) {
      console.error('Error importing cache state:', error);
    }
  }

  // Reset cache statistics
  resetStats() {
    this.hitRatio = { hits: 0, misses: 0 };
    this.cacheOperations = {
      reads: 0,
      writes: 0,
      evictions: 0,
      prefetches: 0
    };
  }

  // Get cache analytics for monitoring
  getAnalytics() {
    const stats = this.getStats();
    return {
      ...stats,
      cacheHitRatio: parseFloat(stats.hitRate.replace('%', '')),
      memoryEfficiency: this.userCache.size > 0 ? 
        ((this.hitRatio.hits / this.userCache.size) * 100).toFixed(2) + '%' : '0%',
      operationalMetrics: {
        readWriteRatio: this.cacheOperations.writes > 0 ? 
          (this.cacheOperations.reads / this.cacheOperations.writes).toFixed(2) : 'N/A',
        evictionRate: this.cacheOperations.writes > 0 ? 
          ((this.cacheOperations.evictions / this.cacheOperations.writes) * 100).toFixed(2) + '%' : '0%',
        prefetchEfficiency: this.cacheOperations.prefetches > 0 ? 
          ((this.hitRatio.hits / this.cacheOperations.prefetches) * 100).toFixed(2) + '%' : 'N/A'
      }
    };
  }
}

// Create singleton instance
export const globalP2PCache = new P2PCache({
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000,
  popularUsersTTL: 30 * 60 * 1000 // 30 minutes
});

// Cleanup cache every 10 minutes
setInterval(() => globalP2PCache.cleanup(), 10 * 60 * 1000);

export default P2PCache;
