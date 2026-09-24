import React, { useState } from 'react';
import {
  Radar,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Eye,
  Building,
  RefreshCw,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { SafetyRadarMetric } from '../types';

const ZONE_METRICS: Record<string, SafetyRadarMetric> = {
  'Central Delhi (Connaught Place)': {
    overallScore: 92,
    zoneName: 'Central Delhi (Connaught Place)',
    lightingGrade: 'A+',
    policeResponseTimeMinutes: 3.2,
    activeCctvCount: 142,
    nearbySafeHavensCount: 6,
    recentIncidentsCount: 0,
    safetyAdvice:
      'High security perimeter with continuous pink patrol coverage, active metro security, and 24/7 commercial surveillance.',
  },
  'Hauz Khas & Green Park Corridor': {
    overallScore: 84,
    zoneName: 'Hauz Khas & Green Park Corridor',
    lightingGrade: 'A',
    policeResponseTimeMinutes: 4.5,
    activeCctvCount: 88,
    nearbySafeHavensCount: 4,
    recentIncidentsCount: 1,
    safetyAdvice:
      'Main arterial roads are well illuminated. Exercise caution on secondary alleys after 11 PM.',
  },
  'Noida Sector 62 IT Park': {
    overallScore: 78,
    zoneName: 'Noida Sector 62 IT Park',
    lightingGrade: 'B',
    policeResponseTimeMinutes: 5.8,
    activeCctvCount: 64,
    nearbySafeHavensCount: 3,
    recentIncidentsCount: 2,
    safetyAdvice:
      'Moderate pedestrian density during office shift changes. Use verified high-mast transit corridors.',
  },
  'Gurugram Cyber Hub & Golf Course Road': {
    overallScore: 88,
    zoneName: 'Gurugram Cyber Hub & Golf Course Road',
    lightingGrade: 'A',
    policeResponseTimeMinutes: 3.8,
    activeCctvCount: 110,
    nearbySafeHavensCount: 5,
    recentIncidentsCount: 1,
    safetyAdvice:
      'Private security guards and rapid PCR van mobility present. Rapid transit metro safely linked.',
  },
  'Old Delhi Railway & Chandni Chowk Area': {
    overallScore: 68,
    zoneName: 'Old Delhi Railway & Chandni Chowk Area',
    lightingGrade: 'C',
    policeResponseTimeMinutes: 6.5,
    activeCctvCount: 52,
    nearbySafeHavensCount: 3,
    recentIncidentsCount: 4,
    safetyAdvice:
      'Dense crowd conditions during market hours. Several narrow lanes have obstructed lighting. Keep guardians alerted.',
  },
};

export const SafetyRadar: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('Central Delhi (Connaught Place)');
  const [isScanning, setIsScanning] = useState(false);

  const metric = ZONE_METRICS[selectedZone] || ZONE_METRICS['Central Delhi (Connaught Place)'];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-indigo-600';
    return 'text-amber-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
            <Radar className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Suraksha Urban Safety Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                Live Sensor Mesh
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Aggregated crime index, municipal lighting sensors, and police beat telemetry
            </p>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(ZONE_METRICS).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-50"
            title="Rescan Zone"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Radar Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
        {/* Big Safety Score Dial */}
        <div className="flex flex-col items-center justify-center text-center p-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Zone Safety Rating
          </span>
          <div className="relative flex items-center justify-center">
            {/* Circular Radar Glow */}
            <div className="w-32 h-32 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  metric.overallScore >= 85
                    ? 'border-emerald-500'
                    : metric.overallScore >= 70
                    ? 'border-indigo-500'
                    : 'border-amber-500'
                } border-t-transparent animate-pulse`}
              />
              <div className="text-center">
                <span className={`text-4xl font-black ${getScoreColor(metric.overallScore)}`}>
                  {metric.overallScore}
                </span>
                <span className="text-xs text-slate-400 font-bold block">/ 100</span>
              </div>
            </div>
          </div>
          <span
            className={`mt-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              metric.overallScore >= 85
                ? 'bg-emerald-100 text-emerald-800'
                : metric.overallScore >= 70
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {metric.overallScore >= 85
              ? 'High Safety Zone'
              : metric.overallScore >= 70
              ? 'Moderately Safe'
              : 'Caution Advised'}
          </span>
        </div>

        {/* 4 Sensor Micro-Metrics */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Street Lighting</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">Grade {metric.lightingGrade}</p>
            <span className="text-[10px] text-slate-400">High-Mast Sodium &amp; LED</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">PCR Response Time</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">
              ~{metric.policeResponseTimeMinutes} mins
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Priority Beat Unit</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Municipal CCTVs</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">{metric.activeCctvCount} Active</p>
            <span className="text-[10px] text-slate-400">Smart City Feeds</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Safe Havens</span>
              <Building className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">
              {metric.nearbySafeHavensCount} Within 800m
            </p>
            <span className="text-[10px] text-slate-400">Police, Hospital, Metro</span>
          </div>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 space-y-0.5">
          <p className="font-bold">Real-time Civic Safety Advisory:</p>
          <p className="text-indigo-800/90">{metric.safetyAdvice}</p>
        </div>
      </div>
    </div>
  );
};
