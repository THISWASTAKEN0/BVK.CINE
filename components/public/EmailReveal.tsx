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
      <button
        onClick={revealed ? copy : reveal}
        aria-label={revealed ? 'Copy email' : 'Reveal email'}
        className="p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--border)',
          border: '1px solid var(--border-strong)',
          cursor: 'pointer',
        }}
      >
        {revealed
          ? copied
            ? <Check size={15} style={{ color: 'var(--accent)' }} />
            : <Copy size={15} style={{ color: 'var(--text-secondary)' }} />
          : <Mail size={15} style={{ color: 'var(--text-secondary)' }} />
        }
      </button>

      {revealed ? (
        <a
          href={`mailto:${email}`}
          className="text-[15px] font-light transition-opacity hover:opacity-100"
          style={{ letterSpacing: '0.01em', color: 'var(--text-secondary)' }}
        >
          {email}
        </a>
      ) : (
        <button
          onClick={reveal}
          className="text-[15px] font-light transition-opacity hover:opacity-70"
          style={{
            filter: 'blur(5px)',
            letterSpacing: '0.01em',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
            userSelect: 'none',
            color: 'var(--text-primary)',
            opacity: 0.45,
          }}
          aria-label="Reveal email address"
        >
          {email}
        </button>
      )}
    </div>
  );
}
