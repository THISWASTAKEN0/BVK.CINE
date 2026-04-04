'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'Alex Chen';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        setError('Incorrect email or password. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = '/admin/dashboard';
    } else {
      // Sign up — one-time setup
      const { error: err } = await supabase.auth.signUp({ email, password });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setSignupSuccess(true);
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="font-semibold text-[18px] mb-2">Check your email</h2>
          <p className="text-[14px] text-text-secondary leading-relaxed">
            We sent a confirmation link to{' '}
            <strong className="text-text-primary">{email}</strong>. Confirm your
            email, then come back and sign in.
          </p>
          <button
            className="mt-6 w-full py-2.5 rounded-xl border border-black/10 text-[14px] font-medium text-text-secondary hover:bg-surface transition-colors"
            onClick={() => { setMode('signin'); setSignupSuccess(false); }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-7">
          <p className="font-semibold text-[16px] text-text-primary tracking-tight">
            {PHOTOGRAPHER_NAME}
          </p>
          <p className="text-[13px] text-text-secondary mt-1">
            {mode === 'signin' ? 'Sign in to your admin panel' : 'Create your admin account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[15px] placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-text-primary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-black/10 text-[15px] placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-destructive bg-red-50 px-3.5 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-accent text-white text-[15px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 mt-1"
          >
            {loading
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-5 text-center">
          {mode === 'signin' ? (
            <p className="text-[13px] text-text-secondary">
              First time?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-accent hover:underline"
              >
                Create your admin account
              </button>
            </p>
          ) : (
            <p className="text-[13px] text-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(''); }}
                className="text-accent hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
