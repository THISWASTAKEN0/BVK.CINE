'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props {
  collections: Collection[];
}

const ROTATIONS = [-4,  3, -2,  5, -3,  4, -5,  2];
const TRANSLATES = [ 0, 18,  6, -10, 14, -6,  4, -14]; // px Y nudge per card

export default function CollectionGrid({ collections }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!collections.length) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
        <p className="font-light">No collections published yet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '56px 40px',
        padding: '28px 4px 52px',
        alignItems: 'start',
      }}
    >
      {collections.map((col, i) => {
        const rotation  = ROTATIONS[i  % ROTATIONS.length];
        const ty        = TRANSLATES[i % TRANSLATES.length];
        const cover     = col.cover_photo?.cloudinary_public_id;
        const isHov     = hovered === i;

        return (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'block',
              background: '#fff',
              padding: '11px 11px 46px',
              transform: isHov
                ? 'rotate(0deg) translateY(0px) scale(1.04)'
                : `rotate(${rotation}deg) translateY(${ty}px)`,
              boxShadow: isHov
                ? '0 22px 70px rgba(0,0,0,0.65)'
                : '0 5px 28px rgba(0,0,0,0.52)',
              transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s',
              cursor: 'pointer',
              willChange: 'transform',
              zIndex: isHov ? 2 : 1,
              position: 'relative',
            }}
          >
            {/* Photo */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
              {cover ? (
                <Image
                  src={thumbUrl(cover)}
                  alt={col.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#ddd' }} />
              )}
            </div>

            {/* Caption */}
            <p style={{
              textAlign: 'center',
              marginTop: 14,
              fontSize: 13,
              color: '#888',
              fontStyle: 'italic',
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: '0.03em',
              lineHeight: 1.4,
            }}>
              {col.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
