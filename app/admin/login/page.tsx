'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'BVK.Cine';

function SuccessCheck() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-5">
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" width={80} height={80} style={{ position: 'absolute', inset: 0 }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34}`}
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
              animation: 'login-circle 0.45s cubic-bezier(0.65,0,0.35,1) 0.05s forwards',
            }}
          />
        </svg>
        <svg viewBox="0 0 80 80" width={80} height={80} style={{ position: 'absolute', inset: 0 }}>
          <polyline
            points="22,42 35,55 58,28" fill="none" stroke="white" strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="60" strokeDashoffset="60"
            style={{ animation: 'login-check 0.35s cubic-bezier(0.65,0,0.35,1) 0.42s forwards' }}
          />
        </svg>
      </div>
      <p
        className="text-[15px] font-medium tracking-wide"
        style={{ color: 'rgba(255,255,255,0.85)', opacity: 0, animation: 'login-fade-up 0.4s ease 0.65s forwards' }}
      >
        Welcome back
      </p>
      <style>{`
        @keyframes login-circle { to { stroke-dashoffset: 0; } }
        @keyframes login-check  { to { stroke-dashoffset: 0; } }
        @keyframes login-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);
  const [zooming, setZooming]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError('Incorrect email or password.'); setLoading(false); return; }
    setSuccess(true);
    // "Welcome back" fully visible at ~1050ms — wait a beat then zoom
    setTimeout(() => setZooming(true), 1300);
    setTimeout(() => { window.location.href = '/admin/dashboard'; }, 1850);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#ffffff',
  };
  const inputFocus = {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: '#ffffff',
  };
  const inputBase = 'w-full px-3.5 py-2.5 rounded-xl text-[15px] placeholder:text-text-secondary focus:outline-none transition';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Aurora blobs ─────────────────────────────────── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: zooming ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div className="aurora-blob" style={{ width: 700, height: 580, top: '-5%', left: '0%', background: 'radial-gradient(ellipse, rgba(0,230,210,0.90) 0%, transparent 68%)', animation: 'aurora-a 14s ease-in-out infinite' }} />
        <div className="aurora-blob" style={{ width: 760, height: 600, top: '30%', right: '-5%', background: 'radial-gradient(ellipse, rgba(140,0,255,0.88) 0%, transparent 68%)', animation: 'aurora-b 18s ease-in-out infinite' }} />
        <div className="aurora-blob" style={{ width: 600, height: 680, bottom: '-5%', left: '-6%', background: 'radial-gradient(ellipse, rgba(20,100,255,0.82) 0%, transparent 68%)', animation: 'aurora-c 13s ease-in-out infinite' }} />
        <div className="aurora-blob" style={{ width: 500, height: 500, top: '20%', left: '30%', background: 'radial-gradient(ellipse, rgba(220,0,180,0.72) 0%, transparent 68%)', animation: 'aurora-d 17s ease-in-out infinite' }} />
        <div className="aurora-blob" style={{ width: 480, height: 400, bottom: '10%', right: '10%', background: 'radial-gradient(ellipse, rgba(0,220,120,0.62) 0%, transparent 68%)', animation: 'aurora-a 21s ease-in-out infinite reverse' }} />
      </div>

      {/* Veil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(8, 9, 14, 0.18)',
          opacity: zooming ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Card wrapper ─────────────────────────────────── */}
      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div
          className="text-center mb-8"
          style={{
            opacity: success ? 0 : 1,
            transform: success ? 'translateY(-8px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-3" style={{ color: 'rgba(220,225,255,0.5)' }}>
            Admin Panel
          </p>
          <h1 className="text-[28px] font-bold tracking-tight text-white drop-shadow-lg">
            {PHOTOGRAPHER_NAME}
          </h1>
        </div>

        {/* Glassmorphic card — zooms to fill screen on success */}
        <div
          style={{
            background: zooming ? '#0c0d12' : 'rgba(10, 12, 20, 0.18)',
            backdropFilter: zooming ? 'none' : 'blur(40px) saturate(180%) brightness(0.95)',
            WebkitBackdropFilter: zooming ? 'none' : 'blur(40px) saturate(180%) brightness(0.95)',
            border: zooming ? '1px solid transparent' : '1px solid rgba(255,255,255,0.13)',
            boxShadow: zooming ? 'none' : '0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 24px 48px rgba(0,0,0,0.3)',
            borderRadius: zooming ? '0px' : '20px',
            padding: '32px',
            transform: zooming ? 'scale(22)' : 'scale(1)',
            transformOrigin: 'center center',
            transition: zooming
              ? 'transform 0.55s cubic-bezier(0.4,0,1,1), border-radius 0.55s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, backdrop-filter 0.1s ease'
              : 'background 0.4s ease, border-color 0.4s ease',
          }}
        >
          {success ? <SuccessCheck /> : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Email
                </label>
                <input
                  id="email" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputBase} style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputBase} pr-10`} style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                    style={{ color: 'rgba(175,182,215,0.5)' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl text-[13px]" style={{ background: 'rgba(255,77,79,0.15)', color: '#ff8080', border: '1px solid rgba(255,77,79,0.25)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-[15px] font-semibold text-white transition-opacity disabled:opacity-50 mt-1"
                style={{ background: 'linear-gradient(135deg, rgba(107,140,255,0.9) 0%, rgba(150,80,255,0.9) 100%)', boxShadow: '0 4px 24px rgba(107,140,255,0.35)' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
