import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';

// GET /api/collections — fetch all collections with cover photo + photo count
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data: collections, error: colErr } = await admin
      .from('collections')
      .select('*')
      .order('display_order', { ascending: true });

    if (colErr) throw colErr;

    // Fetch photo counts and cover photos separately to avoid PostgREST join ambiguity
    const ids = (collections ?? []).map((c) => c.id);

    const [{ data: photos }, { data: covers }] = await Promise.all([
      admin.from('photos').select('id, collection_id').in('collection_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']),
      admin.from('photos').select('id, collection_id, cloudinary_public_id, cloudinary_url'),
    ]);

    const photosByCollection = (photos ?? []).reduce<Record<string, number>>((acc, p) => {
      acc[p.collection_id] = (acc[p.collection_id] ?? 0) + 1;
      return acc;
    }, {});

    const coverById = (covers ?? []).reduce<Record<string, { id: string; cloudinary_public_id: string; cloudinary_url: string }>>((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const result = (collections ?? []).map((col) => ({
      ...col,
      photo_count: photosByCollection[col.id] ?? 0,
      cover_photo: col.cover_photo_id ? (coverById[col.cover_photo_id] ?? null) : null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('[collections GET]', err);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, shoot_date, is_published } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: maxRow } = await admin
      .from('collections')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const display_order = (maxRow?.display_order ?? -1) + 1;

    const { data, error } = await admin
      .from('collections')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        shoot_date: shoot_date || null,
        is_published: is_published ?? true,
        display_order,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[collections POST]', err);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
