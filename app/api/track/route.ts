import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server';

// POST /api/track — public. Records one page view.
// Uses the anon client, which can only INSERT into page_views (per RLS).
export async function POST(request: NextRequest) {
  try {
    // Cheap bot filter — don't count crawlers/monitors
    const ua = request.headers.get('user-agent') ?? '';
    if (!ua || /bot|crawl|spider|slurp|bing|preview|monitor|headless|lighthouse/i.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body?.path === 'string' ? body.path : '/';
    const path = rawPath.slice(0, 300);

    // First-party visitor id so we can count unique visitors
    const store = cookies();
    let visitorId = store.get('bvk_vid')?.value;
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    const supabase = createServerClient();
    await supabase.from('page_views').insert({ path, visitor_id: visitorId });

    const res = NextResponse.json({ ok: true });
    if (isNewVisitor) {
      res.cookies.set('bvk_vid', visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }
    return res;
  } catch (err) {
    console.error('[track]', err);
    // Never let analytics break a page — always succeed quietly
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
