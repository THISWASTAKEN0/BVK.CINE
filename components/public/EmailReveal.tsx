'use client';

import { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';

export default function EmailReveal({ email }: { email: string }) {
  const [revealed, setReveal] = useState(false);
  const [copied, setCopied]   = useState(false);

  const reveal = () => setReveal(true);

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3.5 w-full justify-center py-1">
      {/* Icon button — click to reveal */}
      <button
        onClick={revealed ? copy : reveal}
        aria-label={revealed ? 'Copy email' : 'Reveal email'}
        className="p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
        }}
      >
        {revealed
          ? copied
            ? <Check size={15} className="text-white/80" />
            : <Copy size={15} className="text-white/45" />
          : <Mail size={15} className="text-white/45" />
        }
      </button>

      {revealed ? (
        /* Revealed: clickable mailto link */
        <a
          href={`mailto:${email}`}
          className="text-[15px] font-light text-white/65 hover:text-white transition-colors"
          style={{ letterSpacing: '0.01em' }}
        >
          {email}
        </a>
      ) : (
        /* Hidden: blurred placeholder */
        <button
          onClick={reveal}
          className="text-[15px] font-light text-white/40 transition-colors hover:text-white/60"
          style={{
            filter: 'blur(5px)',
            letterSpacing: '0.01em',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            userSelect: 'none',
          }}
          aria-label="Reveal email address"
        >
          {email}
        </button>
      )}
    </div>
  );
}
