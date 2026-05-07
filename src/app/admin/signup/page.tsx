'use client';

import { useActionState } from 'react';
import { adminSignupAction, SignupState } from './auth-actions';
import { Lock, Mail, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminSignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    adminSignupAction,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-2xl shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white font-quantico bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin Registration
          </h1>
          <p className="text-slate-500 text-sm mt-2">Create an editor account for the CMS</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Admin Name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@nobrakes.com"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60"
            >
              {pending ? 'Creating Account...' : 'Register as Editor'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Already have an admin account?{' '}
              <Link href="/admin/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
