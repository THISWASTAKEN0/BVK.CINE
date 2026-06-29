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
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError('Incorrect email or password.'); setLoading(false); return; }
    window.location.href = '/admin/dashboard';
  };

  /* Inputs get a semi-transparent dark background so they read against the blurred aurora */
  const inputStyle = {
    background: 'rgba(8, 9, 16, 0.55)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'var(--text-primary)',
  };
  const inputFocus = { ...inputStyle, borderColor: 'rgba(107,140,255,0.7)' };
  const inputBase  = 'w-full px-3.5 py-2.5 rounded-xl text-[15px] placeholder:text-text-secondary focus:outline-none transition';

  return (
    /* The layout already sets .admin-site (#0c0d12 bg), so this div just needs to fill it */
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Aurora blobs ─────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Teal / cyan */}
        <div
          className="aurora-blob"
          style={{
            width: 640, height: 520,
            top: '2%', left: '8%',
            background: 'radial-gradient(ellipse, rgba(0,220,200,0.72) 0%, transparent 70%)',
            animation: 'aurora-a 14s ease-in-out infinite',
          }}
        />
        {/* Violet / purple */}
        <div
          className="aurora-blob"
          style={{
            width: 700, height: 540,
            top: '35%', right: '2%',
            background: 'radial-gradient(ellipse, rgba(130,0,255,0.68) 0%, transparent 70%)',
            animation: 'aurora-b 18s ease-in-out infinite',
          }}
        />
        {/* Royal blue */}
        <div
          className="aurora-blob"
          style={{
            width: 540, height: 620,
            bottom: '0%', left: '-4%',
            background: 'radial-gradient(ellipse, rgba(20,90,255,0.65) 0%, transparent 70%)',
            animation: 'aurora-c 13s ease-in-out infinite',
          }}
        />
        {/* Magenta / rose */}
        <div
          className="aurora-blob"
          style={{
            width: 420, height: 420,
            top: '15%', right: '28%',
            background: 'radial-gradient(ellipse, rgba(220,0,180,0.52) 0%, transparent 70%)',
            animation: 'aurora-d 17s ease-in-out infinite',
          }}
        />
        {/* Emerald green — subtle depth */}
        <div
          className="aurora-blob"
          style={{
            width: 460, height: 360,
            bottom: '18%', right: '15%',
            background: 'radial-gradient(ellipse, rgba(0,210,120,0.42) 0%, transparent 70%)',
            animation: 'aurora-a 21s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Slight dark veil so the aurora doesn't overpower the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(8, 9, 14, 0.38)' }}
      />

      {/* ── Card ─────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm">
        {/* Name / header above the card */}
        <div className="text-center mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-3"
            style={{ color: 'rgba(220,225,255,0.5)' }}
          >
            Admin Panel
          </p>
          <h1 className="text-[28px] font-bold tracking-tight text-white drop-shadow-lg">
            {PHOTOGRAPHER_NAME}
          </h1>
        </div>

        {/* Glassmorphic card — the aurora shows through the blur */}
        <div
          style={{
            background: 'rgba(10, 11, 18, 0.30)',
            backdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
            WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 1.5px 0 rgba(255,255,255,0.15) inset, 0 32px 80px rgba(0,0,0,0.45)',
            borderRadius: '20px',
            padding: '32px',
          }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium mb-1.5"
                style={{ color: 'rgba(220,225,255,0.8)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium mb-1.5"
                style={{ color: 'rgba(220,225,255,0.8)' }}
              >
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
                  className={`${inputBase} pr-10`}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(175,182,215,0.5)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-3.5 py-2.5 rounded-xl text-[13px]"
                style={{
                  background: 'rgba(255,77,79,0.15)',
                  color: '#ff8080',
                  border: '1px solid rgba(255,77,79,0.25)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[15px] font-semibold text-white transition-opacity disabled:opacity-50 mt-1"
              style={{
                background: 'linear-gradient(135deg, rgba(107,140,255,0.9) 0%, rgba(150,80,255,0.9) 100%)',
                boxShadow: '0 4px 24px rgba(107,140,255,0.35)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
