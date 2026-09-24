/**
 * Offline Map Tile Manager for Suraksha India
 * Pre-downloads and caches Web Mercator raster map tiles along travel corridors
 * using the browser CacheStorage API, enabling turn-by-turn map rendering
 * without cellular or Wi-Fi connectivity.
 */

export interface DownloadProgress {
  routeId: string;
  totalTiles: number;
  downloadedTiles: number;
  failedTiles: number;
  percent: number;
  status: 'idle' | 'calculating' | 'downloading' | 'completed' | 'error';
  errorMessage?: string;
  sizeBytes?: number;
}

export interface DownloadedRouteMeta {
  routeId: string;
  routeName: string;
  downloadTimestamp: number;
  tileCount: number;
  sizeBytes: number;
  zoomLevels: number[];
  origin?: string;
  destination?: string;
}

export const TILE_CACHE_NAME = 'suraksha-offline-maptiles-v1';
const ROUTE_META_KEY = 'suraksha_downloaded_routes_meta';

// Standard CartoDB Voyager URL template
export const TILE_URL_TEMPLATE = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const SUBDOMAINS = ['a', 'b', 'c', 'd'];

// Convert Longitude to Tile X
export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

// Convert Latitude to Tile Y
export function lat2tile(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

// Build concrete Tile URL from coordinates
export function getTileUrl(x: number, y: number, z: number, subdomainIndex = 0): string {
  const s = SUBDOMAINS[Math.abs(subdomainIndex) % SUBDOMAINS.length];
  return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

/**
 * Calculates unique tile keys along a corridor buffer for given zoom levels
 */
export function getTilesForRoute(
  waypoints: [number, number][],
  minZoom = 12,
  maxZoom = 15,
  bufferPadding = 1
): { x: number; y: number; z: number; url: string }[] {
  if (!waypoints || waypoints.length === 0) return [];

  const tileMap = new Map<string, { x: number; y: number; z: number; url: string }>();

  // Find bounding box with buffer
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of waypoints) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  for (let z = minZoom; z <= maxZoom; z++) {
    // Collect tiles along each waypoint segment with a corridor buffer
    for (const [lat, lng] of waypoints) {
      const centerX = lon2tile(lng, z);
      const centerY = lat2tile(lat, z);

      for (let dx = -bufferPadding; dx <= bufferPadding; dx++) {
        for (let dy = -bufferPadding; dy <= bufferPadding; dy++) {
          const x = centerX + dx;
          const y = centerY + dy;
          const key = `${z}/${x}/${y}`;

          if (!tileMap.has(key)) {
            const url = getTileUrl(x, y, z, (x + y) % SUBDOMAINS.length);
            tileMap.set(key, { x, y, z, url });
          }
        }
      }
    }
  }

  return Array.from(tileMap.values());
}

/**
 * Pre-downloads and caches all map tiles for a route into CacheStorage
 */
export async function downloadRouteTiles(
  routeId: string,
  routeName: string,
  waypoints: [number, number][],
  onProgress?: (progress: DownloadProgress) => void,
  origin?: string,
  destination?: string
): Promise<boolean> {
  if (!('caches' in window)) {
    throw new Error('CacheStorage API is not supported in this browser environment.');
  }

  const minZoom = 12;
  const maxZoom = 15;
  const tiles = getTilesForRoute(waypoints, minZoom, maxZoom, 1);
  const totalTiles = tiles.length;

  if (totalTiles === 0) {
    onProgress?.({
      routeId,
      totalTiles: 0,
      downloadedTiles: 0,
      failedTiles: 0,
      percent: 100,
      status: 'completed',
    });
    return true;
  }

  onProgress?.({
    routeId,
    totalTiles,
    downloadedTiles: 0,
    failedTiles: 0,
    percent: 0,
    status: 'downloading',
  });

  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    let downloadedCount = 0;
    let failedCount = 0;
    let totalBytes = 0;

    // Concurrent batch downloading (concurrency of 6 parallel requests)
    const BATCH_SIZE = 6;
    for (let i = 0; i < tiles.length; i += BATCH_SIZE) {
      const batch = tiles.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (tile) => {
          try {
            // Check if already in cache
            const existing = await cache.match(tile.url);
            if (existing) {
              const blob = await existing.blob();
              totalBytes += blob.size;
              downloadedCount++;
            } else {
              // Fetch from network
              const response = await fetch(tile.url, {
                mode: 'cors',
                cache: 'reload',
              });

              if (response.ok) {
                const clone = response.clone();
                const blob = await clone.blob();
                totalBytes += blob.size;
                await cache.put(tile.url, response);
                downloadedCount++;
              } else {
                failedCount++;
              }
            }
          } catch {
            failedCount++;
          }

          const currentTotal = downloadedCount + failedCount;
          const percent = Math.min(100, Math.round((currentTotal / totalTiles) * 100));

          onProgress?.({
            routeId,
            totalTiles,
            downloadedTiles: downloadedCount,
            failedTiles: failedCount,
            percent,
            status: 'downloading',
            sizeBytes: totalBytes,
          });
        })
      );
    }

    // Save metadata
    saveRouteMeta({
      routeId,
      routeName,
      downloadTimestamp: Date.now(),
      tileCount: downloadedCount,
      sizeBytes: totalBytes,
      zoomLevels: [12, 13, 14, 15],
      origin,
      destination,
    });

    onProgress?.({
      routeId,
      totalTiles,
      downloadedTiles: downloadedCount,
      failedTiles: failedCount,
      percent: 100,
      status: 'completed',
      sizeBytes: totalBytes,
    });

    return true;
  } catch (err: any) {
    onProgress?.({
      routeId,
      totalTiles,
      downloadedTiles: 0,
      failedTiles: 0,
      percent: 0,
      status: 'error',
      errorMessage: err.message || 'Failed to download tiles.',
    });
    return false;
  }
}

/**
 * Checks whether tiles for a specific route are saved in cache
 */
export async function isRouteTilesCached(routeId: string): Promise<boolean> {
  const routes = getDownloadedRoutes();
  const existsInMeta = routes.some((r) => r.routeId === routeId);
  if (!existsInMeta) return false;

  if ('caches' in window) {
    const hasCache = await caches.has(TILE_CACHE_NAME);
    return hasCache;
  }
  return false;
}

/**
 * Retrieves metadata for all downloaded routes
 */
export function getDownloadedRoutes(): DownloadedRouteMeta[] {
  try {
    const raw = localStorage.getItem(ROUTE_META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves metadata for a downloaded route
 */
function saveRouteMeta(meta: DownloadedRouteMeta) {
  try {
    const existing = getDownloadedRoutes().filter((r) => r.routeId !== meta.routeId);
    existing.push(meta);
    localStorage.setItem(ROUTE_META_KEY, JSON.stringify(existing));
  } catch {}
}

/**
 * Removes downloaded route tiles and deletes metadata
 */
export async function deleteRouteTiles(routeId: string, waypoints?: [number, number][]): Promise<void> {
  // If waypoints provided, remove specific URLs from cache
  if (waypoints && 'caches' in window) {
    try {
      const cache = await caches.open(TILE_CACHE_NAME);
      const tiles = getTilesForRoute(waypoints, 12, 15);
      for (const t of tiles) {
        await cache.delete(t.url);
      }
    } catch {}
  }

  // Remove from metadata
  try {
    const existing = getDownloadedRoutes().filter((r) => r.routeId !== routeId);
    localStorage.setItem(ROUTE_META_KEY, JSON.stringify(existing));
  } catch {}
}

/**
 * Clears the entire offline tile cache
 */
export async function clearAllOfflineTiles(): Promise<void> {
  if ('caches' in window) {
    await caches.delete(TILE_CACHE_NAME);
  }
  localStorage.removeItem(ROUTE_META_KEY);
}

/**
 * Formats bytes to human-readable size string
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
