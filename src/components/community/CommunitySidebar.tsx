import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  HeartHandshake,
  ExternalLink,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommunitySidebarProps {
  onSelectTopicTag?: (tag: string) => void;
  onOpenNewDiscussion?: () => void;
}

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  onSelectTopicTag,
  onOpenNewDiscussion,
}) => {
  return (
    <aside className="space-y-6">
      {/* Card 1: Community Network Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Community Status
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Network Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Active Guardians</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">2,481</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Weekly Posts</span>
            <span className="text-base font-extrabold text-indigo-700 font-mono">128</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Verified Updates</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">24</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Avg Response</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">&lt; 4m</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewDiscussion}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Share Safety Guidance</span>
        </button>
      </div>

      {/* Card 2: Community Guidelines */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Community Guidelines
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Suraksha India is a verified public safety network dedicated to proactive urban protection and citizen mutual aid.
        </p>

        <ul className="space-y-2.5 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Share verified details:</strong> Include exact landmarks, lighting conditions, or police booths.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Protect privacy:</strong> Never post personal phone numbers or private identifying details.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Report hazards:</strong> Flag misleading or unverified panic claims to keep alerts reliable.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Civic respect:</strong> Support fellow commuters, women, and seniors with constructive guidance.</span>
          </li>
        </ul>
      </div>

      {/* Card 3: Verified Safety Contributors */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Verified Contributors
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Delhi NCR</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Contributor 1: Police Safety Wing */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/safety_official_avatar_1790173396514.jpg"
              alt="Delhi Police Safety Wing"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 truncate">Delhi Police Safety Wing</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold shrink-0">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">Central Command &amp; Pink Booths</p>
            </div>
          </div>

          {/* Contributor 2: Citizen Guardian Volunteer */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/volunteer_guardian_avatar_1790173414588.jpg"
              alt="Priya Verma"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 truncate">Priya Verma</span>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold shrink-0">
                  Guardian
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">South Delhi Evening Transit Escort</p>
            </div>
          </div>

          {/* Contributor 3: Metro Marshal Squad */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
              MM
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 truncate">Metro Marshal Squad</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold shrink-0">
                  Transit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">Yellow &amp; Magenta Line Patrols</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Trending Safety Topics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Trending Safety Topics
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            'Safe Routes',
            'Metro Gate 2',
            'Pink Booths',
            'Night Transit',
            'High-Mast Lights',
            'Emergency 112',
            'Women Helpline 1091',
            'Zero FIR',
          ].map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onSelectTopicTag && onSelectTopicTag(topic)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              #{topic}
            </button>
          ))}
        </div>
      </div>

      {/* Card 5: Emergency Escalation Helper */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-400" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-rose-300">
            Immediate Crisis?
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Forum discussions are for community guidance. If you are in immediate danger, do not wait for a reply.
        </p>
        <div className="pt-1 flex gap-2">
          <Link
            to="/emergency"
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold text-center transition-colors"
          >
            Trigger SOS
          </Link>
          <a
            href="tel:112"
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold text-center border border-slate-700 transition-colors"
          >
            Dial 112
          </a>
        </div>
      </div>
    </aside>
  );
};
