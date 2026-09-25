import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoLoggingIn, setDemoLoggingIn] = useState<'CITIZEN' | 'ADMIN' | null>(null);

  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleInstantDemoLogin = async (role: 'CITIZEN' | 'ADMIN') => {
    setErrorMessage(null);
    setDemoLoggingIn(role);
    const emailToUse = role === 'CITIZEN' ? 'citizen@suraksha.in' : 'admin@suraksha.gov.in';
    const passwordToUse = role === 'CITIZEN' ? 'citizen123' : 'admin123';
    
    try {
      const result = await login(emailToUse, passwordToUse);
      if (result.success) {
        navigate(role === 'ADMIN' ? '/admin' : '/home');
      } else {
        setErrorMessage(result.message || 'Demo login failed');
        setDemoLoggingIn(null);
      }
    } catch {
      setErrorMessage('Unable to connect to demo authentication service');
      setDemoLoggingIn(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      if (!name || !email || !password || !phone) {
        setErrorMessage('Please fill in all registration fields');
        return;
      }
      const result = await register({ name, email, password, phone });
      if (result.success) {
        navigate('/home');
      } else {
        setErrorMessage(result.message || 'Registration failed');
      }
    } else {
      if (!email || !password) {
        setErrorMessage('Please enter email and password');
        return;
      }
      const result = await login(email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setErrorMessage(result.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-lg w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xl shadow-rose-900/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isRegister ? 'Create Citizen Account' : 'Suraksha SafeCity Portal'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Smart India Tech Suite for Urban Safety &amp; Emergency SOS
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Instant Demo Access (Zero Setup)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Evaluate all features immediately with pre-configured mock data
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              1-Click
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Citizen 1-Click Demo */}
            <button
              type="button"
              disabled={isLoading || demoLoggingIn !== null}
              onClick={() => handleInstantDemoLogin('CITIZEN')}
              className="group p-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Citizen Demo
                  </span>
                </div>
                {demoLoggingIn === 'CITIZEN' ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Priya Verma • 2 Guardians &amp; Live Telemetry
              </p>
            </button>

            {/* Admin 1-Click Demo */}
            <button
              type="button"
              disabled={isLoading || demoLoggingIn !== null}
              onClick={() => handleInstantDemoLogin('ADMIN')}
              className="group p-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-rose-500/40 hover:border-rose-400 text-left transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                    Safety Admin Demo
                  </span>
                </div>
                {demoLoggingIn === 'ADMIN' ? (
                  <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Dr. Anita Sharma • Central Control Centre
              </p>
            </button>
          </div>
        </div>

        {/* Standard Sign-In Form Container */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-md">
          {/* Section Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-semibold text-[11px]">
                {isRegister ? 'Register New Profile' : 'Or Sign In with Credentials'}
              </span>
            </div>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Verma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@suraksha.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number (for SMS &amp; WhatsApp SOS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading && !demoLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isRegister ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
