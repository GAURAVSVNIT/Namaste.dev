import { NextResponse } from 'next/server';
import { globalP2PCache } from '@/lib/p2p-cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const format = searchParams.get('format') || 'json';

    switch (action) {
      case 'stats':
        const stats = globalP2PCache.getStats();
        if (format === 'prometheus') {
          // Return Prometheus-compatible metrics
          const prometheusMetrics = `
# HELP p2p_cache_hit_rate Cache hit rate percentage
# TYPE p2p_cache_hit_rate gauge
p2p_cache_hit_rate ${parseFloat(stats.hitRate.replace('%', ''))}

# HELP p2p_cache_size Current cache size
# TYPE p2p_cache_size gauge
p2p_cache_size ${stats.cacheSize}

# HELP p2p_cache_hits Total cache hits
# TYPE p2p_cache_hits counter
p2p_cache_hits ${stats.hits}

# HELP p2p_cache_misses Total cache misses
# TYPE p2p_cache_misses counter
p2p_cache_misses ${stats.misses}

# HELP p2p_cache_prewarmed_users Number of prewarmed users
# TYPE p2p_cache_prewarmed_users gauge
p2p_cache_prewarmed_users ${stats.prewarmedUsers}

# HELP p2p_cache_network_peers Number of P2P network peers
# TYPE p2p_cache_network_peers gauge
p2p_cache_network_peers ${stats.networkPeers || 0}
`.trim();
          return new Response(prometheusMetrics, {
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        return NextResponse.json(stats);

      case 'analytics':
        const analytics = globalP2PCache.getAnalytics();
        return NextResponse.json(analytics);

      case 'export':
        const cacheState = globalP2PCache.exportCacheState();
        return new Response(cacheState, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=cache-state.json'
          }
        });

      case 'reset':
        globalP2PCache.resetStats();
        return NextResponse.json({ message: 'Cache statistics reset successfully' });

      case 'cleanup':
        globalP2PCache.cleanup();
        return NextResponse.json({ message: 'Cache cleanup completed' });

      default:
        return NextResponse.json(globalP2PCache.getStats());
    }
  } catch (error) {
    console.error('Error in cache monitoring API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache monitoring data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'import':
        if (!data || typeof data !== 'string') {
          return NextResponse.json(
            { error: 'Invalid cache state data' },
            { status: 400 }
          );
        }
        globalP2PCache.importCacheState(data);
        return NextResponse.json({ message: 'Cache state imported successfully' });

      case 'add_peer':
        if (!data || !data.peerId) {
          return NextResponse.json(
            { error: 'Peer ID is required' },
            { status: 400 }
          );
        }
        globalP2PCache.addPeer(data.peerId);
        return NextResponse.json({ message: `Peer ${data.peerId} added successfully` });

      case 'remove_peer':
        if (!data || !data.peerId) {
          return NextResponse.json(
            { error: 'Peer ID is required' },
            { status: 400 }
          );
        }
        globalP2PCache.removePeer(data.peerId);
        return NextResponse.json({ message: `Peer ${data.peerId} removed successfully` });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in cache monitoring POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process cache monitoring request' },
      { status: 500 }
    );
  }
}
