import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, ImageIcon } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/public/Navbar';
import PhotoMasonryGrid from '@/components/public/PhotoMasonryGrid';
import type { Collection, Photo } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 30;

type PageProps = { params: { id: string } };

async function getCollection(id: string) {
  const supabase = createServerClient();

  const { data: collection, error: colErr } = await supabase
    .from('collections')
    .select(`
      *,
      cover_photo:photos!cover_photo_id (
        id,
        cloudinary_public_id,
        cloudinary_url
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (colErr || !collection) return null;

  const { data: photos, error: photoErr } = await supabase
    .from('photos')
    .select('*')
    .eq('collection_id', id)
    .order('display_order', { ascending: true });

  if (photoErr) {
    console.error('[collection page] fetch photos error', photoErr);
  }

  return { collection: collection as Collection, photos: (photos ?? []) as Photo[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getCollection(params.id);
  if (!result) return { title: 'Collection Not Found' };
  return { title: result.collection.name };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CollectionPage({ params }: PageProps) {
  const result = await getCollection(params.id);

  if (!result) notFound();

  const { collection, photos } = result;

  return (
    <div className="public-site">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-20">
        {/* Back */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 text-[14px] mb-10 group transition-opacity hover:opacity-100 opacity-50"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span style={{ color: 'var(--text-primary)' }}>Collections</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-display font-light tracking-tight gradient-text">
            {collection.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} />
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
            {collection.shoot_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(collection.shoot_date)}
              </span>
            )}
          </div>

          {collection.description && (
            <p className="mt-4 text-[16px] font-light leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {collection.description}
            </p>
          )}
        </div>

        {/* Photo grid + lightbox */}
        <PhotoMasonryGrid photos={photos} />
      </main>
    </div>
  );
}
