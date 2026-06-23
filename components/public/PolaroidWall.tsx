'use client';

import { useState } from 'react';
import Image from 'next/image';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props {
  collections: Collection[];
}

const SCATTER = [
  { top: '3%',  left: '3%',  rotation: -6 },
  { top: '9%',  left: '43%', rotation:  4 },
  { top: '50%', left: '6%',  rotation: -3 },
  { top: '46%', left: '46%', rotation:  5 },
];

export default function PolaroidWall({ collections }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const cards = collections
    .filter((c) => c.cover_photo?.cloudinary_public_id)
    .slice(0, 4);

  if (!cards.length) return null;

  return (
    <>
      {/* ── Desktop: scattered absolute layout ── */}
      <div className="hidden md:block relative w-full" style={{ height: 420 }}>
        {cards.map((col, i) => {
          const cfg = SCATTER[i] ?? SCATTER[0];
          const isHov = hovered === i;
          return (
            <div
              key={col.id}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'absolute',
                top: cfg.top,
                left: cfg.left,
                transform: isHov
                  ? 'rotate(0deg) scale(1.06)'
                  : `rotate(${cfg.rotation}deg)`,
                background: '#fff',
                padding: '9px 9px 34px',
                boxShadow: isHov
                  ? '0 20px 64px rgba(0,0,0,0.70)'
                  : '0 5px 24px rgba(0,0,0,0.52)',
                transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s',
                zIndex: isHov ? 10 : i + 1,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 148, height: 128, overflow: 'hidden', position: 'relative' }}>
                <Image
                  src={thumbUrl(col.cover_photo!.cloudinary_public_id)}
                  alt={col.name}
                  fill
                  className="object-cover"
                  sizes="148px"
                />
              </div>
              <p style={{
                fontSize: 10,
                color: '#999',
                textAlign: 'center',
                margin: '8px 0 0',
                letterSpacing: '0.04em',
                fontStyle: 'italic',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                {col.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Mobile: horizontal scroll row ── */}
      <div
        className="md:hidden flex gap-5 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {cards.map((col, i) => {
          const rotation = (SCATTER[i]?.rotation ?? 0) * 0.5;
          return (
            <div
              key={col.id}
              style={{
                flexShrink: 0,
                transform: `rotate(${rotation}deg)`,
                background: '#fff',
                padding: '7px 7px 26px',
                boxShadow: '0 3px 18px rgba(0,0,0,0.48)',
              }}
            >
              <div style={{ width: 104, height: 90, overflow: 'hidden', position: 'relative' }}>
                <Image
                  src={thumbUrl(col.cover_photo!.cloudinary_public_id)}
                  alt={col.name}
                  fill
                  className="object-cover"
                  sizes="104px"
                />
              </div>
              <p style={{
                fontSize: 9,
                color: '#aaa',
                textAlign: 'center',
                margin: '6px 0 0',
                letterSpacing: '0.03em',
                fontStyle: 'italic',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                {col.name}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
