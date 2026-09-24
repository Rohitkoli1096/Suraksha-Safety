import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  PhoneCall,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Smart India Hackathon Initiative • Smart City Citizen Protection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Real-Time Protection &amp;{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Smart Safe Routes
            </span>{' '}
            for Every Citizen
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            Empowering women, students, and citizens with instant One-Touch SOS, automated journey check-in timers,
            civic hazard reporting, and AI-assisted safe corridor routing.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <NavLink
              to={user ? '/emergency' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldAlert className="w-5 h-5" />
              {user ? 'Open Emergency Command' : 'Get Protected Now'}
            </NavLink>

            <NavLink
              to={user ? '/routes' : '/login'}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Safe Routes</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>

          {/* Quick stats strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-rose-400">1-Touch</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Instant SOS Dispatch</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">94.8%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">High-Mast Safe Corridors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">112</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Direct Emergency Link</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">24 / 7</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Community Guardians</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-rose-600 uppercase tracking-widest">Suraksha Ecosystem</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Urban Safety Architecture
          </p>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            Engineered to replace standalone panic buttons with an interconnected network of civic sensors, guardian
            alerting, and safe transit routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: One Touch SOS */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">One-Touch SOS &amp; Siren</h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Triggers instant audible alarm, broadcasts verified GPS coordinates to family guardians, and sends dispatch
              records to city emergency response desks.
            </p>
            <div className="mt-6 flex items-center gap-2 text-rose-600 text-xs font-bold">
              <span>Audible Alarm + GPS Live Tag</span>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2: Safe Route Navigation */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Safe Route Finder</h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Calculates routes weighted by street lighting coverage, police beat patrol density, CCTV coverage, and safe
              havens like 24/7 hospitals and open pharmacies.
            </p>
            <div className="mt-6 flex items-center gap-2 text-indigo-600 text-xs font-bold">
              <span>Pink Corridors &amp; Safe Havens</span>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3: Safety Timer (Walk With Me) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Safety Timer "Walk With Me"</h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Walking home alone? Start a countdown check-in. If you don't enter your safety PIN or check in before the
              timer runs out, distress SOS triggers automatically.
            </p>
            <div className="mt-6 flex items-center gap-2 text-amber-600 text-xs font-bold">
              <span>Automated Timeout Trigger</span>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Feature row 2 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Citizen Hazard &amp; Blackspot Reporting</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                Report broken streetlights, deserted underpasses, or harassment spots. Upvote civic hazards to escalate
                directly to municipal departments for fast remediation.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Community Safety Watch</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                Crowdsourced local updates on metro kiosk safety, police booth openings, active volunteer patrols, and
                verified neighborhood safety advisories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* National Helplines Strip */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">Official Government Emergency Direct Dials</h3>
              <p className="text-xs text-slate-400 mt-1">Available 24/7 across all telecom circles in India</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:112"
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>112 (National Emergency)</span>
              </a>
              <a
                href="tel:1091"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-pink-400" />
                <span>1091 (Women Helpline)</span>
              </a>
              <a
                href="tel:100"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-indigo-400" />
                <span>100 (Police Control)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
