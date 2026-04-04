'use client';

import Image from 'next/image';
import Link from 'next/link';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props {
  collection: Collection;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function CollectionCard({ collection }: Props) {
  const coverPublicId = collection.cover_photo?.cloudinary_public_id;
  const count = collection.photo_count ?? 0;
  const objectPosition = collection.cover_photo_position ?? '50% 50%';

  return (
    <Link href={`/collections/${collection.id}`} className="block group card-iri">
      <div
        className="relative rounded-[20px] overflow-hidden cursor-pointer"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {coverPublicId ? (
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src={thumbUrl(coverPublicId)}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              style={{ objectPosition }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Permanent subtle gradient so text is readable */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />

            {/* Iridescent shimmer at top edge on hover */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, rgba(255,80,160,0.7), rgba(80,180,255,0.7), rgba(80,255,200,0.6), rgba(200,80,255,0.7))',
                backgroundSize: '200% 100%',
                animation: 'iri-shift 4s ease infinite',
              }}
            />

            {/* Glass info panel — slides up on hover */}
            <div
              className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
              style={{
                background: 'rgba(6, 7, 18, 0.6)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderTop: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              {/* Top specular */}
              <div className="absolute inset-x-0 top-0 h-px" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }} />
              <div className="px-4 py-4">
                <p className="text-white font-semibold text-[15px] leading-tight chromatic-sm">
                  {collection.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-white/50 text-[12px]">{count} {count === 1 ? 'photo' : 'photos'}</span>
                  {collection.shoot_date && (
                    <>
                      <span className="text-white/25 text-[11px]">·</span>
                      <span className="text-white/50 text-[12px]">{formatDate(collection.shoot_date)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Always-visible name — fades out when panel slides up */}
            <div className="absolute inset-x-0 bottom-0 px-4 py-3 group-hover:opacity-0 transition-opacity duration-200">
              <p className="text-white font-medium text-[14px] truncate drop-shadow-md">{collection.name}</p>
            </div>
          </div>
        ) : (
          <div
            className="aspect-[4/3] flex items-center justify-center"
            style={{ background: 'var(--surface-2, var(--surface))' }}
          >
            <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>No cover photo</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="aspect-[4/3] skeleton rounded-[20px]" />
    </div>
  );
}
