import React, { useState } from 'react';
import { Compass, Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { appStore, DEMO_USERS } from '../lib/database/store';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (route: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!fullName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        appStore.registerUser(fullName, email);
        setIsLoading(false);
        onNavigate('/dashboard');
      }, 500);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        // Find existing user or log in as Diya
        const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
        appStore.setCurrentUser(matched);
        setIsLoading(false);
        onNavigate('/dashboard');
      }, 400);
    }
  };

  const handleQuickLogin = (demoIndex: number) => {
    appStore.setCurrentUser(DEMO_USERS[demoIndex]);
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back to WayTogether' : 'Create Your WayTogether Account'}
          </h2>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Log in to manage your group journeys and living itineraries.'
              : 'Join the collaborative group AI travel platform.'}
          </p>
        </div>

        {/* Quick Demo Traveler Logins */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            1-Click Demo Login:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickLogin(0)}
              className="py-1.5 px-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 font-medium text-stone-800 text-left truncate"
            >
              Diya (Trip Owner)
            </button>
            <button
              onClick={() => handleQuickLogin(1)}
              className="py-1.5 px-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 font-medium text-stone-800 text-left truncate"
            >
              Rahul (Nature/Photos)
            </button>
            <button
              onClick={() => handleQuickLogin(2)}
              className="py-1.5 px-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 font-medium text-stone-800 text-left truncate"
            >
              Ananya (Food/Culture)
            </button>
            <button
              onClick={() => handleQuickLogin(3)}
              className="py-1.5 px-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 font-medium text-stone-800 text-left truncate"
            >
              Dev (Budget/Heritage)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-stone-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Diya Patel"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-stone-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="font-bold text-stone-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="font-bold text-amber-700 hover:underline"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="font-bold text-amber-700 hover:underline"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
