import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for monitoring P2P cache performance
 * Provides real-time cache statistics and control functions
 */
export const useP2PCache = (options = {}) => {
  const {
    refreshInterval = 30000, // 30 seconds default
    autoRefresh = true,
    enableRealtime = false
  } = options;

  const [cacheStats, setCacheStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const websocketRef = useRef(null);

  // Fetch cache statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cache-monitor?action=stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stats = await response.json();
      setCacheStats(stats);
      return stats;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cache stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/cache-monitor?action=analytics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cache analytics:', err);
      return null;
    }
  };

  // Reset cache statistics
  const resetStats = async () => {
    try {
      const response = await fetch('/api/cache-monitor?action=reset');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchStats(); // Refresh stats after reset
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error resetting cache stats:', err);
      return false;
    }
  };

  // Force cache cleanup
  const cleanup = async () => {
    try {
      const response = await fetch('/api/cache-monitor?action=cleanup');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchStats(); // Refresh stats after cleanup
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error during cache cleanup:', err);
      return false;
    }
  };

  // Export cache state
  const exportCacheState = async () => {
    try {
      const response = await fetch('/api/cache-monitor?action=export');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cache-state-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error exporting cache state:', err);
      return false;
    }
  };

  // Import cache state
  const importCacheState = async (cacheData) => {
    try {
      const response = await fetch('/api/cache-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import',
          data: cacheData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchStats(); // Refresh stats after import
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error importing cache state:', err);
      return false;
    }
  };

  // Add P2P peer
  const addPeer = async (peerId) => {
    try {
      const response = await fetch('/api/cache-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_peer',
          data: { peerId }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchStats(); // Refresh stats after adding peer
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error adding peer:', err);
      return false;
    }
  };

  // Remove P2P peer
  const removePeer = async (peerId) => {
    try {
      const response = await fetch('/api/cache-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove_peer',
          data: { peerId }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchStats(); // Refresh stats after removing peer
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error removing peer:', err);
      return false;
    }
  };

  // Calculate cache health score
  const getCacheHealth = () => {
    if (!cacheStats) return null;

    const hitRate = parseFloat(cacheStats.hitRate.replace('%', ''));
    const efficiency = parseFloat(cacheStats.cacheEfficiency.replace('%', ''));
    
    let health = 'good';
    let score = 100;

    if (hitRate < 30) {
      health = 'poor';
      score -= 40;
    } else if (hitRate < 60) {
      health = 'fair';
      score -= 20;
    }

    if (efficiency < 20) {
      score -= 20;
    }

    if (cacheStats.cacheSize > 800) { // Near max capacity
      score -= 10;
    }

    if (score < 60) health = 'poor';
    else if (score < 80) health = 'fair';

    return { health, score, recommendations: getRecommendations(hitRate, efficiency) };
  };

  // Get performance recommendations
  const getRecommendations = (hitRate, efficiency) => {
    const recommendations = [];

    if (hitRate < 50) {
      recommendations.push('Consider increasing cache TTL for popular users');
      recommendations.push('Implement more aggressive cache warming strategies');
    }

    if (efficiency < 30) {
      recommendations.push('Review user popularity detection algorithm');
      recommendations.push('Consider adjusting cache size limits');
    }

    if (cacheStats?.networkPeers === 0) {
      recommendations.push('Connect to P2P network for improved cache sharing');
    }

    return recommendations;
  };

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      fetchStats(); // Initial fetch
      
      intervalRef.current = setInterval(() => {
        fetchStats();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (enableRealtime) {
      // Note: This would require a WebSocket server implementation
      // For now, we'll use more frequent polling
      const realtimeInterval = setInterval(fetchStats, 5000); // 5 seconds
      
      return () => clearInterval(realtimeInterval);
    }
  }, [enableRealtime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return {
    // State
    cacheStats,
    analytics,
    loading,
    error,
    
    // Actions
    fetchStats,
    fetchAnalytics,
    resetStats,
    cleanup,
    exportCacheState,
    importCacheState,
    addPeer,
    removePeer,
    
    // Computed values
    cacheHealth: getCacheHealth(),
    
    // Utilities
    refresh: fetchStats,
    isHealthy: getCacheHealth()?.health === 'good'
  };
};

export default useP2PCache;
