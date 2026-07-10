'use client';

import { useEffect } from 'react';

/**
 * Fires a single lightweight ping to /api/track on mount for public pages.
 * - Skips /admin so the photographer's own visits aren't counted.
 * - Dedupes per path per browser session (a reload won't inflate views).
 * Renders nothing.
 */
export default function VisitTracker() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return;

    const key = `bvk_tracked:${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
