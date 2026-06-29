'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'BVK.Cine';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Incorrect email or password.');
      setLoading(false);
      return;
    }
    window.location.href = '/admin/dashboard';
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none transition';
  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border-strong)',
  };
  const inputFocusStyle = { borderColor: 'var(--accent)' };

  return (
    <div
      className="admin-site min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(107,140,255,0.12) 0%, rgba(107,140,255,0.04) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary mb-3">
            Admin Panel
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-text-primary">
            {PHOTOGRAPHER_NAME}
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
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
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-3.5 py-2.5 rounded-xl text-[13px]"
                style={{ background: 'rgba(255,77,79,0.1)', color: 'var(--destructive)', border: '1px solid rgba(255,77,79,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[15px] font-semibold text-white transition-opacity disabled:opacity-50 mt-1"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
