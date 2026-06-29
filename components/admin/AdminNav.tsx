'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'BVK.CINE';

export default function AdminNav() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'rgba(12, 13, 18, 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <span className="font-bold tracking-wider text-[14px] text-text-primary">
            {PHOTOGRAPHER_NAME.toUpperCase()}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              background: 'rgba(107, 140, 255, 0.1)',
            }}
          >
            Admin
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface"
          >
            <ExternalLink size={13} />
            View Site
          </Link>

          <div className="w-px h-4 mx-1" style={{ background: 'var(--border-strong)' }} />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-surface"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
