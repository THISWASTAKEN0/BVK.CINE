import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { collection_id, cloudinary_public_id, cloudinary_url, filename } = body;

    if (!collection_id || !cloudinary_public_id || !cloudinary_url || !filename) {
      return NextResponse.json(
        { error: 'collection_id, cloudinary_public_id, cloudinary_url, and filename are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: maxRow } = await admin
      .from('photos')
      .select('display_order')
      .eq('collection_id', collection_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const display_order = (maxRow?.display_order ?? -1) + 1;

    const { data, error } = await admin
      .from('photos')
      .insert({
        collection_id,
        cloudinary_public_id,
        cloudinary_url,
        filename,
        display_order,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[photos POST]', err);
    return NextResponse.json(
      { error: 'Failed to save photo metadata' },
      { status: 500 }
    );
  }
}
