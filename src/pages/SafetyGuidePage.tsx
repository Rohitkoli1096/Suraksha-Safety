import React, { useState } from 'react';
import {
  Scale,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  BookOpen,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';

interface Helpline {
  name: string;
  number: string;
  department: string;
  hours: string;
  description: string;
}

const HELPLINES: Helpline[] = [
  {
    name: 'National Emergency Helpline',
    number: '112',
    department: 'Ministry of Home Affairs',
    hours: '24/7 All-India',
    description: 'Unified single emergency number for Police, Fire, and Ambulance dispatch.',
  },
  {
    name: 'Women in Distress Helpline',
    number: '1091',
    department: 'State Police Special Cell',
    hours: '24/7 Dedicated',
    description: 'Immediate police patrol response and guidance for women facing threats or harassment.',
  },
  {
    name: 'National Commission for Women (NCW)',
    number: '7827170170',
    department: 'NCW 24/7 Helpline',
    hours: '24/7 Helpline',
    description: 'Grievance registration, emergency intervention, and legal counsel support.',
  },
  {
    name: 'Cyber Crime Emergency Reporting',
    number: '1930',
    department: 'Indian Cyber Crime Coordination (I4C)',
    hours: '24/7 Helpline',
    description: 'Report online harassment, stalking, deepfakes, or cyber extortion immediately.',
  },
  {
    name: 'Railway Protection Force (RPF)',
    number: '139',
    department: 'Indian Railways Security',
    hours: '24/7 In-Transit',
    description: 'Direct security assistance on platforms, suburban coaches, and long-distance trains.',
  },
  {
    name: 'Childline & Minor Protection',
    number: '1098',
    department: 'Ministry of Women & Child Development',
    hours: '24/7 Toll-Free',
    description: 'Emergency rescue and protection for girls and children in distress.',
  },
];

const LEGAL_RIGHTS = [
  {
    title: 'Right to Zero FIR (Section 154 CrPC / BNSS)',
    summary:
      'Any police station is legally required to register a First Information Report (FIR) irrespective of where the incident occurred.',
    detail:
      'A police officer cannot refuse to lodge an FIR on the grounds of lack of territorial jurisdiction. Once registered, it is assigned a Zero number and transferred to the jurisdictional station. Refusal to register is punishable under Section 166A of the Indian Penal Code.',
    tag: 'Absolute Right',
  },
  {
    title: 'Restrictions on Arrest of Women (Section 46(4) CrPC)',
    summary:
      'Women cannot be arrested between sunset and sunrise except under extraordinary circumstances.',
    detail:
      'No woman shall be arrested after sunset and before sunrise. In extraordinary circumstances, the arrest can only be made by a woman police officer after obtaining prior permission from a Judicial Magistrate.',
    tag: 'Procedural Protection',
  },
  {
    title: 'Confidential In-Camera Statement (Section 164 CrPC)',
    summary:
      'Survivors have the right to have their statement recorded in private before a woman magistrate.',
    detail:
      'In cases of sexual offences, the statement of the victim must be recorded by a woman judicial officer without anyone else present in the room to preserve privacy and prevent intimidation.',
    tag: 'Privacy Right',
  },
  {
    title: 'Right to Free Legal Aid (Legal Services Authorities Act)',
    summary:
      'All women are entitled to free legal aid regardless of their income or financial status.',
    detail:
      'Under Section 12 of the Legal Services Authorities Act, every woman is entitled to free legal assistance, court representation, and advice provided by the National Legal Services Authority (NALSA) and State Legal Services Authorities.',
    tag: 'Statutory Support',
  },
  {
    title: 'Right to Medical Examination without Delay',
    summary:
      'Any hospital, public or private, must provide immediate free first aid and medical examination.',
    detail:
      'Under Section 357C CrPC, all hospitals (government or private) are legally mandated to immediately provide free first-aid and medical treatment to victims of sexual assault. Delay or refusal is a criminal offence.',
    tag: 'Healthcare Right',
  },
];

export const SafetyGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RIGHTS' | 'HELPLINES' | 'DEESCALATION'>('RIGHTS');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>Constitutional Protections &amp; Rapid Assistance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Know Your Legal Rights &amp; Helplines
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Authoritative guide to Indian legal rights, Zero FIR procedures, and one-tap emergency response helplines.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('RIGHTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'RIGHTS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Constitutional &amp; Criminal Rights
        </button>
        <button
          onClick={() => setActiveTab('HELPLINES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'HELPLINES'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Emergency Helplines Directory
        </button>
        <button
          onClick={() => setActiveTab('DEESCALATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'DEESCALATION'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Safety &amp; Transit Protocols
        </button>
      </div>

      {/* TAB 1: Rights */}
      {activeTab === 'RIGHTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              <span className="font-bold">Legal Knowledge is Your Shield:</span> Police officers are legally bound to uphold these provisions. If any official refuses to register a Zero FIR, you may immediately report the refusal by calling <span className="font-bold underline">112</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEGAL_RIGHTS.map((r, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                    {r.tag}
                  </span>
                  <Scale className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-900 text-base">{r.title}</h3>
                <p className="font-semibold text-xs text-slate-700">{r.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Helplines */}
      {activeTab === 'HELPLINES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HELPLINES.map((h, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {h.hours}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                    {h.department}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{h.name}</h3>
                <p className="text-xs text-slate-600">{h.description}</p>
              </div>

              <a
                href={`tel:${h.number}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call {h.number}</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Protocols */}
      {activeTab === 'DEESCALATION' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Safe Urban Commute Best Practices
              </h3>
              <p className="text-xs text-slate-500">
                Actionable guidelines for lone commuters, cabs, and late-night travel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <span>🚗</span>
                <span>Cab / Auto Ride Protocols</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                <li>Verify the vehicle registration number plate matches your app booking before boarding.</li>
                <li>Check child locks on the rear doors (ensure the door can be opened from the inside).</li>
                <li>Speak aloud on the phone or use Suraksha’s <b>Decoy Call</b> simulator: <i>"I am in cab DL 1Y 4821, heading home now."</i></li>
                <li>Arm the <b>Safety Timer</b> with your estimated arrival duration.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <span>🚶‍♀️</span>
                <span>Lone Walking on Unlit Corridors</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                <li>Walk on the side of the road facing oncoming traffic so no car can pull up behind you unnoticed.</li>
                <li>Keep one earbud out to maintain situational hearing and awareness of footfalls.</li>
                <li>If followed, cross the street immediately or head into an open 24/7 store or fuel station.</li>
                <li>Hold your phone with Suraksha’s SOS Panic button armed.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
