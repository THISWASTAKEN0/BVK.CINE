'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'ALEX CHEN';

export default function AdminNav() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-black/8">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="font-semibold tracking-tight text-[15px] text-text-primary"
        >
          {PHOTOGRAPHER_NAME}
          <span className="ml-2 text-[11px] font-normal text-text-secondary bg-surface px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ExternalLink size={14} />
            View Site
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
