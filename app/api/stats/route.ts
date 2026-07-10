import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';

// GET /api/stats — auth required. Aggregated visitor analytics.
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('visitor_stats');
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[stats]', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
