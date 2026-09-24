import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  Trash2,
  HardDrive,
  WifiOff,
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderDown,
  Layers,
} from 'lucide-react';
import { SafeRouteOption } from '../types';
import {
  downloadRouteTiles,
  isRouteTilesCached,
  getDownloadedRoutes,
  deleteRouteTiles,
  clearAllOfflineTiles,
  formatBytes,
  DownloadProgress,
  DownloadedRouteMeta,
} from '../utils/offlineMapTileManager';
import { triggerHaptic, hapticPatterns } from '../utils/haptics';

interface OfflineRouteTileDownloaderProps {
  activeRoute: SafeRouteOption;
  sourceText?: string;
  destinationText?: string;
  onDownloadedStateChange?: (isCached: boolean) => void;
  className?: string;
}

export const OfflineRouteTileDownloader: React.FC<OfflineRouteTileDownloaderProps> = ({
  activeRoute,
  sourceText,
  destinationText,
  onDownloadedStateChange,
  className = '',
}) => {
  const [isCached, setIsCached] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [allDownloaded, setAllDownloaded] = useState<DownloadedRouteMeta[]>([]);
  const [currentRouteMeta, setCurrentRouteMeta] = useState<DownloadedRouteMeta | null>(null);

  // Check cached state whenever activeRoute changes
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      const cached = await isRouteTilesCached(activeRoute.id);
      if (isMounted) {
        setIsCached(cached);
        onDownloadedStateChange?.(cached);
        const all = getDownloadedRoutes();
        setAllDownloaded(all);
        const found = all.find((r) => r.routeId === activeRoute.id) || null;
        setCurrentRouteMeta(found);
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [activeRoute.id]);

  const handleStartDownload = async () => {
    if (!activeRoute.waypoints || activeRoute.waypoints.length === 0) return;

    triggerHaptic(hapticPatterns.tap);
    const success = await downloadRouteTiles(
      activeRoute.id,
      activeRoute.name,
      activeRoute.waypoints,
      (p) => {
        setProgress(p);
      },
      sourceText,
      destinationText
    );

    if (success) {
      triggerHaptic(hapticPatterns.success);
      setIsCached(true);
      onDownloadedStateChange?.(true);
      const all = getDownloadedRoutes();
      setAllDownloaded(all);
      const found = all.find((r) => r.routeId === activeRoute.id) || null;
      setCurrentRouteMeta(found);
      setTimeout(() => {
        setProgress(null);
      }, 3500);
    } else {
      triggerHaptic(hapticPatterns.warning);
    }
  };

  const handleDelete = async (routeId: string) => {
    triggerHaptic(hapticPatterns.warning);
    await deleteRouteTiles(routeId, activeRoute.id === routeId ? activeRoute.waypoints : undefined);
    const cached = await isRouteTilesCached(activeRoute.id);
    setIsCached(cached);
    onDownloadedStateChange?.(cached);
    const all = getDownloadedRoutes();
    setAllDownloaded(all);
    const found = all.find((r) => r.routeId === activeRoute.id) || null;
    setCurrentRouteMeta(found);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all pre-downloaded map tiles and offline corridors from device storage?')) {
      return;
    }
    await clearAllOfflineTiles();
    setIsCached(false);
    onDownloadedStateChange?.(false);
    setAllDownloaded([]);
    setCurrentRouteMeta(null);
  };

  const totalStorageBytes = allDownloaded.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  return (
    <div className={`rounded-2xl border transition-all ${isCached ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-slate-200/90'} p-4 shadow-xs ${className}`}>
      {/* Top row: Status & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isCached
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}
          >
            {isCached ? <CheckCircle2 className="w-5 h-5" /> : <FolderDown className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {isCached ? 'Offline Route Map Cached' : 'Offline Route Map Pre-Download'}
              </h4>
              {isCached && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Ready Offline
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCached && currentRouteMeta
                ? `${currentRouteMeta.tileCount} tiles saved (${formatBytes(currentRouteMeta.sizeBytes)}) • Fully navigable without cellular network`
                : 'Cache map tiles along this travel corridor for uninterrupted navigation in cellular dead-zones.'}
            </p>
          </div>
        </div>

        {/* Action Button & Modal Trigger */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {allDownloaded.length > 0 && (
            <button
              type="button"
              onClick={() => setShowManagerModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Manage Offline Corridors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Storage ({formatBytes(totalStorageBytes)})</span>
            </button>
          )}

          {isCached ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartDownload}
                disabled={progress?.status === 'downloading'}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Re-download latest tiles"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(activeRoute.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete downloaded tiles for this corridor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartDownload}
              disabled={progress?.status === 'downloading'}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {progress?.status === 'downloading' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading ({progress.percent}%)...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download Offline Tiles</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (While Downloading) */}
      {progress && progress.status === 'downloading' && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Caching zoom levels 12-15 along {activeRoute.name}...</span>
            </span>
            <span className="text-indigo-700 font-bold">
              {progress.downloadedTiles} / {progress.totalTiles} tiles ({progress.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Completed Banner */}
      {progress && progress.status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Successfully pre-downloaded {progress.downloadedTiles} map tiles ({formatBytes(progress.sizeBytes || 0)}). Offline corridor active!
          </span>
        </div>
      )}

      {/* Error Banner */}
      {progress && progress.status === 'error' && (
        <div className="mt-3 pt-3 border-t border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{progress.errorMessage || 'Tile download failed. Check network connection.'}</span>
        </div>
      )}

      {/* Offline Storage Manager Modal */}
      {showManagerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Offline Corridors &amp; Map Cache
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total stored: {formatBytes(totalStorageBytes)} across {allDownloaded.length} corridor(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowManagerModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of Cached Corridors */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {allDownloaded.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No routes currently stored in offline cache.
                </div>
              ) : (
                allDownloaded.map((item) => (
                  <div
                    key={item.routeId}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.routeName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.tileCount} tiles • {formatBytes(item.sizeBytes)} • Zooms 12-15
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Downloaded {new Date(item.downloadTimestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.routeId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Delete Corridor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              {allDownloaded.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                >
                  Clear All Tile Cache
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowManagerModal(false)}
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
