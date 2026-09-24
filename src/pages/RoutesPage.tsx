import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Zap,
  Navigation,
  Sun,
  Shield,
  Eye,
  Building,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { SafeRouteOption } from '../types';
import { SafeRouteMap } from '../components/SafeRouteMap';
import { OfflineRouteTileDownloader } from '../components/OfflineRouteTileDownloader';

export const RoutesPage: React.FC = () => {
  const [source, setSource] = useState('Connaught Place, Central Delhi');
  const [destination, setDestination] = useState('Sector 18 Metro, Noida');
  const [routes, setRoutes] = useState<SafeRouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_safest_1');
  const [loading, setLoading] = useState(false);

  const handleSearchRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    const res = await api.post('/routes/options', { source, destination });
    if (res.success && res.data) {
      setRoutes(res.data.routes);
      if (res.data.routes.length > 0) {
        setSelectedRouteId(res.data.routes[0].id);
      }
    }
    setLoading(false);
  };

  // Run initial search
  React.useEffect(() => {
    handleSearchRoutes();
  }, []);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>AI-Powered Safe Urban Navigation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Safe Corridor Route Options
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Compare travel corridors optimized for high-mast street lighting, police presence, and verified safe havens.
          </p>
        </div>
      </div>

      {/* Route Inputs Form */}
      <form
        onSubmit={handleSearchRoutes}
        className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Origin / Pickup
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-indigo-600 absolute left-3 top-3.5" />
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Destination / Drop-off
          </label>
          <div className="relative">
            <Navigation className="w-4 h-4 text-rose-600 absolute left-3 top-3.5" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Corridors...' : 'Calculate Safe Routes'}</span>
          </button>
        </div>
      </form>

      {/* Routes Grid & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Option Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Transit Corridors ({routes.length})
          </h3>

          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      route.type === 'SAFEST_ROUTE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : route.type === 'BALANCED_ROUTE'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {route.type.replace('_', ' ')}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{route.durationMinutes} mins</span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">({route.distanceKm} km)</span>
                  </div>
                </div>

                <h4 className="mt-2 font-bold text-sm text-slate-900">{route.name}</h4>

                {/* Safety Score Meter */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">Suraksha Safety Score</span>
                    <span
                      className={`font-black ${
                        route.safetyScore >= 85
                          ? 'text-emerald-600'
                          : route.safetyScore >= 65
                          ? 'text-indigo-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {route.safetyScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        route.safetyScore >= 85
                          ? 'bg-emerald-500'
                          : route.safetyScore >= 65
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${route.safetyScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Detailed Route Breakdown & Safe Havens */}
        <div className="lg:col-span-2 space-y-6">
          {activeRoute && (
            <OfflineRouteTileDownloader
              activeRoute={activeRoute}
              sourceText={source}
              destinationText={destination}
            />
          )}

          {activeRoute && (
            <SafeRouteMap
              activeRoute={activeRoute}
              originName={source}
              destinationName={destination}
            />
          )}

          {activeRoute && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Selected Corridor</span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{activeRoute.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                    {activeRoute.durationMinutes} Minutes • {activeRoute.distanceKm} km
                  </div>
                </div>
              </div>

              {/* Safety Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium block">Street Lighting</span>
                  <span className="text-base font-black text-slate-900">{activeRoute.streetLightCoverage}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <Shield className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium block">Police Patrol</span>
                  <span className="text-base font-black text-slate-900">{activeRoute.policePatrolCoverage}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <Eye className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium block">CCTV Surveillance</span>
                  <span className="text-base font-black text-slate-900">
                    {activeRoute.cctvSurveillance ? 'Active' : 'Partial'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <Building className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium block">Crowd Activity</span>
                  <span className="text-base font-black text-slate-900">{activeRoute.crowdDensityScore}</span>
                </div>
              </div>

              {/* Caution Alerts */}
              {(activeRoute.warningAlerts || []).length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Safety Advisories for this Route</span>
                  </div>
                  {activeRoute.warningAlerts?.map((w, idx) => (
                    <p key={idx} className="pl-5 text-amber-700">
                      • {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Safe Havens Along this Route */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Safe Havens on this Path</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeRoute.safeHavens.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {h.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Distance from corridor: {h.distanceMeters}m</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
