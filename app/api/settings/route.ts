import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';

// GET /api/settings — public, returns all settings as { key: value }
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) return NextResponse.json({}, { status: 500 });
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return NextResponse.json(map);
}

// PATCH /api/settings — auth required, body: { key: string, value: string }
export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ key, value });
  } catch (err) {
    console.error('[settings PATCH]', err);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
