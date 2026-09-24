import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Clock,
  PhoneCall,
  AlertTriangle,
  Users,
  Plus,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Scale,
  Phone,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { api } from '../api/client';
import { Report, CommunityPost } from '../types';
import { SafetyRadar } from '../components/SafetyRadar';
import { AudioEvidenceRecorder } from '../components/AudioEvidenceRecorder';
import { EmergencyQuickShare } from '../components/EmergencyQuickShare';
import { FakeCallModal } from '../components/FakeCallModal';
import { VoiceSOSTriggerButton } from '../components/VoiceSOSTriggerButton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { activeSOS, startSOSCountdown, currentLocation, requestLocation } = useSOSStore();
  const navigate = useNavigate();

  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocation();
    async function loadDashboardData() {
      try {
        const [repRes, postRes] = await Promise.all([
          api.get<Report[]>('/reports'),
          api.get<CommunityPost[]>('/community'),
        ]);

        if (repRes.success && repRes.data) {
          setRecentReports(repRes.data.slice(0, 3));
        }
        if (postRes.success && postRes.data) {
          setRecentPosts(postRes.data.slice(0, 2));
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [requestLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Safety Status */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Suraksha Protection Active • Safe Urban Zone</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Hello, {user?.name || 'Citizen'}
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-xl">
              Your location is protected. {user?.emergencyContacts?.length || 0} guardian contacts are armed to receive
              instant real-time GPS telemetry in case of emergency.
            </p>
          </div>

          {/* Quick SOS Big Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                if (activeSOS && activeSOS.status === 'ACTIVE') {
                  navigate('/sos');
                } else {
                  startSOSCountdown(5);
                  navigate('/sos');
                }
              }}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold px-6 py-4 rounded-2xl shadow-xl shadow-rose-900/50 flex items-center gap-3 active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-rose-200 font-semibold">
                  Distress Panic
                </span>
                <span className="text-lg font-black leading-none">ACTIVATE SOS</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Safe Routes */}
        <NavLink
          to="/routes"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
            <span>Safe Routes</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Navigate through well-lit streets, police booths &amp; CCTV coverage.
          </p>
        </NavLink>

        {/* Card 2: Safety Timer */}
        <NavLink
          to="/timer"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
            <span>Journey Timer</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            "Walk with me" countdown. Automatically triggers SOS if not disarmed.
          </p>
        </NavLink>

        {/* Card 3: Hazard Report */}
        <NavLink
          to="/reports"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
            <span>Report Hazard</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Report unlit roads, deserted spots or safety concerns to authorities.
          </p>
        </NavLink>

        {/* Card 4: Community Feed */}
        <NavLink
          to="/community"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
            <span>Community Feed</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Safety updates, neighborhood watches, and tips from verified citizens.
          </p>
        </NavLink>
      </div>

      {/* Voice SOS Hands-Free Trigger Banner */}
      <VoiceSOSTriggerButton variant="full" />

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Guardians & Emergency Direct Dials */}
        <div className="space-y-6">
          {/* Emergency Guardians */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Emergency Guardians ({user?.emergencyContacts?.length || 0})
              </h3>
              <NavLink
                to="/profile"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            <div className="space-y-2.5">
              {(user?.emergencyContacts || []).length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">No emergency contacts configured yet.</p>
                  <NavLink
                    to="/profile"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Guardian
                  </NavLink>
                </div>
              ) : (
                user?.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id || contact.phone}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{contact.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 shadow-xs transition-colors"
                      title="Direct Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* National Helplines Dial Quick Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 mb-3">
              Direct Emergency Helplines
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center transition-colors text-center"
              >
                <span className="text-rose-400 font-black text-lg">112</span>
                <span className="text-[10px] text-slate-300 font-medium">National Emergency</span>
              </a>
              <a
                href="tel:1091"
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center transition-colors text-center"
              >
                <span className="text-pink-400 font-black text-lg">1091</span>
                <span className="text-[10px] text-slate-300 font-medium">Women in Distress</span>
              </a>
              <a
                href="tel:100"
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center transition-colors text-center"
              >
                <span className="text-indigo-400 font-black text-lg">100</span>
                <span className="text-[10px] text-slate-300 font-medium">Police Patrol</span>
              </a>
              <a
                href="tel:102"
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center transition-colors text-center"
              >
                <span className="text-emerald-400 font-black text-lg">102</span>
                <span className="text-[10px] text-slate-300 font-medium">Ambulance</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Hazard Reports & Community Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Hazard Reports */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Nearby Citizen Hazard Reports
                </h3>
                <p className="text-xs text-slate-500">Live blackspots flagged by citizens &amp; inspected by civic teams</p>
              </div>
              <NavLink
                to="/reports"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {report.category.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'IN_PROGRESS'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{report.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{report.description}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{report.location.address}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      ▲ {report.upvotesCount} upvotes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Community Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Community Watch Highlights
                </h3>
                <p className="text-xs text-slate-500">Verified crowd updates &amp; safe transit notices</p>
              </div>
              <NavLink
                to="/community"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Open Community</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900">{post.authorName}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
