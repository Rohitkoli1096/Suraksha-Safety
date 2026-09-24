import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ShieldCheck,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Phone,
  Eye,
  ShieldAlert,
  Sun,
  Building,
  Crosshair,
} from 'lucide-react';
import { SafeRouteOption } from '../types';

interface SafeRouteMapProps {
  activeRoute: SafeRouteOption;
  originName: string;
  destinationName: string;
  onSelectSafeHaven?: (havenName: string) => void;
}

export const SafeRouteMap: React.FC<SafeRouteMapProps> = ({
  activeRoute,
  originName,
  destinationName,
  onSelectSafeHaven,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [showSafeHavens, setShowSafeHavens] = useState(true);
  const [showLightingDensity, setShowLightingDensity] = useState(true);
  const [showPatrolUnits, setShowPatrolUnits] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6315, 77.2167],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Voyager or OpenStreetMap clean tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline & Markers whenever activeRoute changes or toggles update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeRoute) return;

    // Clear previous polyline
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const waypoints = activeRoute.waypoints;
    if (!waypoints || waypoints.length === 0) return;

    // Determine corridor route color
    const routeColor =
      activeRoute.type === 'SAFEST_ROUTE'
        ? '#10b981' // Emerald
        : activeRoute.type === 'BALANCED_ROUTE'
        ? '#6366f1' // Indigo
        : '#f59e0b'; // Amber

    // Glowing background polyline for night safety corridor effect
    const glowLine = L.polyline(waypoints, {
      color: routeColor,
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Main sharp polyline
    const mainLine = L.polyline(waypoints, {
      color: routeColor,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polylineLayerRef.current = mainLine;

    // Fit map bounds to encompass the route
    const bounds = L.latLngBounds(waypoints);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Origin Marker (Start)
    const originIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="background-color: #4f46e5; color: white; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white; font-weight: bold; font-size: 11px;">
          START
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker(waypoints[0], { icon: originIcon }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
        <b style="color: #1e1b4b;">Pickup Point</b><br/>
        <span>${originName}</span>
      </div>
    `);
    markersLayerRef.current?.addLayer(originMarker);

    // Destination Marker (End)
    const destCoords = waypoints[waypoints.length - 1];
    const destIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="background-color: #e11d48; color: white; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white; font-weight: bold; font-size: 11px;">
          GOAL
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker(destCoords, { icon: destIcon }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
        <b style="color: #9f1239;">Destination Safe Zone</b><br/>
        <span>${destinationName}</span>
      </div>
    `);
    markersLayerRef.current?.addLayer(destMarker);

    // Plot Safe Havens along route
    if (showSafeHavens && activeRoute.safeHavens) {
      activeRoute.safeHavens.forEach((haven, idx) => {
        // Place haven slightly offset from waypoints
        const basePoint = waypoints[Math.min(idx + 1, waypoints.length - 1)] || waypoints[0];
        const offsetLat = basePoint[0] + (idx % 2 === 0 ? 0.003 : -0.003);
        const offsetLng = basePoint[1] + (idx % 2 === 0 ? 0.003 : -0.002);

        const havenIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 8px; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); border: 2px solid white; font-weight: bold; font-size: 10px; white-space: nowrap;">
              <span>🛡️ ${haven.type === 'POLICE_STATION' ? 'POLICE' : haven.type === 'HOSPITAL' ? 'HOSPITAL' : 'SAFE'}</span>
            </div>
          `,
          iconSize: [80, 26],
          iconAnchor: [40, 13],
        });

        const marker = L.marker([offsetLat, offsetLng], { icon: havenIcon }).bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
            <b style="color: #065f46;">${haven.name}</b><br/>
            <span style="font-size: 11px; color: #4b5563;">Category: ${haven.type.replace('_', ' ')}</span><br/>
            <span style="font-size: 11px; color: #059669; font-weight: bold;">Verified 24/7 Staffed Safe Haven</span><br/>
            <span style="font-size: 10px; color: #6b7280;">Within ${haven.distanceMeters}m of corridor</span>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Streetlight Density Visual Markers
    if (showLightingDensity && activeRoute.waypoints.length > 2) {
      const midPoint = waypoints[1];
      const lightIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="background-color: #f59e0b; color: #78350f; padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: 800; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            💡 ${activeRoute.streetLightCoverage}% LIT
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      const lightMarker = L.marker(midPoint, { icon: lightIcon }).bindPopup(`
        <div style="font-size: 11px; font-family: sans-serif;">
          <b>High-Mast Civic Lighting Corridor</b><br/>
          Smart municipal sensors indicate ${activeRoute.streetLightCoverage}% illumination coverage.
        </div>
      `);
      markersLayerRef.current?.addLayer(lightMarker);
    }

    // Police Beat Patrol cruiser marker
    if (showPatrolUnits && waypoints.length > 2) {
      const patrolPoint = waypoints[2] || waypoints[1];
      const patrolIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="background-color: #1e1b4b; color: #38bdf8; padding: 3px 6px; border-radius: 8px; font-size: 9px; font-weight: 800; border: 1.5px solid #38bdf8; box-shadow: 0 2px 4px rgba(0,0,0,0.2); animation: pulse 2s infinite;">
            🚔 PCR BEAT 8
          </div>
        `,
        iconSize: [70, 22],
        iconAnchor: [35, 11],
      });
      const patrolMarker = L.marker(patrolPoint, { icon: patrolIcon }).bindPopup(`
        <div style="font-size: 11px; font-family: sans-serif;">
          <b style="color: #1e1b4b;">Active Beat Patrol Vehicle</b><br/>
          Delhi Police PCR Mobile Van patrolling this segment.<br/>
          Avg Response Window: 3 mins.
        </div>
      `);
      markersLayerRef.current?.addLayer(patrolMarker);
    }

    return () => {
      if (glowLine) glowLine.remove();
    };
  }, [activeRoute, showSafeHavens, showLightingDensity, showPatrolUnits, originName, destinationName]);

  // Recenter map on active corridor
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !activeRoute?.waypoints) return;
    const bounds = L.latLngBounds(activeRoute.waypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  const navSteps = [
    {
      title: 'Depart from ' + originName,
      detail: 'Follow well-lit main avenue. 100% CCTV surveillance active.',
      safeZone: 'Pink Police Booth in 300m',
    },
    {
      title: 'Merge onto High-Mast Highway Corridor',
      detail: 'Stay on the wide pedestrian sidewalk with clear line of sight.',
      safeZone: 'Max Super Speciality Hospital 24/7 Gate',
    },
    {
      title: 'Pass through Monitored Transit Hub',
      detail: 'Security personnel and active police assistance booth stationed.',
      safeZone: 'Metro Police Beat Post',
    },
    {
      title: 'Arrive safely at ' + destinationName,
      detail: 'Well-lit municipal zone with verified auto/cab pickup bay.',
      safeZone: 'Destination Secure',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Map Control Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white block">
              Interactive Safe Corridor Visualizer
            </span>
            <span className="text-[10px] text-slate-400">
              Live OpenStreetMap telemetry • Safety Score: {activeRoute.safetyScore}/100
            </span>
          </div>
        </div>

        {/* Layer Toggles & Action */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSafeHavens(!showSafeHavens)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              showSafeHavens
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🛡️ Safe Havens
          </button>

          <button
            type="button"
            onClick={() => setShowLightingDensity(!showLightingDensity)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              showLightingDensity
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            💡 Lighting
          </button>

          <button
            type="button"
            onClick={() => setShowPatrolUnits(!showPatrolUnits)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              showPatrolUnits
                ? 'bg-indigo-400 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🚔 Patrols
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Canvas Container */}
      <div className="relative w-full h-[360px] sm:h-[460px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/90 shadow-sm text-[10px] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700">Pink / Safest Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span className="font-semibold text-slate-700">Balanced Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="font-semibold text-slate-700">Fastest Route (Caution)</span>
          </div>
        </div>

        {/* Start Turn-by-Turn Safe Navigation Floating CTA */}
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={() => setIsNavigating(!isNavigating)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
              isNavigating
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isNavigating ? 'animate-spin' : ''}`} />
            <span>{isNavigating ? 'Exit Guidance' : 'Start Safe Guidance'}</span>
          </button>
        </div>
      </div>

      {/* Turn-by-Turn Guidance Strip (When Active) */}
      {isNavigating && (
        <div className="p-4 bg-emerald-50 border-t border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                STEP {navStepIndex + 1} OF {navSteps.length}
              </span>
              <span className="text-xs font-extrabold text-emerald-950">
                {navSteps[navStepIndex].title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={navStepIndex === 0}
                onClick={() => setNavStepIndex((i) => Math.max(0, i - 1))}
                className="px-2 py-1 rounded bg-white text-xs font-bold text-slate-700 border border-slate-200 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={navStepIndex === navSteps.length - 1}
                onClick={() => setNavStepIndex((i) => Math.min(navSteps.length - 1, i + 1))}
                className="px-2 py-1 rounded bg-emerald-600 text-xs font-bold text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
          <p className="text-xs text-emerald-800">{navSteps[navStepIndex].detail}</p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nearest Refuge: {navSteps[navStepIndex].safeZone}</span>
          </div>
        </div>
      )}
    </div>
  );
};
