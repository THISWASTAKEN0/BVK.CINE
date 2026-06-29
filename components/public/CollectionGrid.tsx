'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props { collections: Collection[] }

const ROTATIONS  = [-4,  3, -2,  5, -3,  4, -5,  2];
const TRANSLATES = [ 0, 18,  6, -10, 14, -6,  4, -14];

function CollectionCard({ col, rotation, ty }: { col: Collection; rotation: number; ty: number }) {
  const cardRef    = useRef<HTMLAnchorElement>(null);
  const hovering   = useRef(false);
  const cover      = col.cover_photo?.cloudinary_public_id;

  const base = `perspective(900px) rotateZ(${rotation}deg) translateY(${ty}px) scale(1)`;

  const onEnter = () => {
    hovering.current = true;
    const el = cardRef.current;
    if (!el) return;
    el.style.transition  = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s';
    el.style.transform   = 'perspective(900px) rotateZ(0deg) translateY(0px) rotateX(0deg) rotateY(0deg) scale(1.05)';
    el.style.boxShadow   = '0 28px 80px rgba(0,0,0,0.72)';
    el.style.zIndex      = '2';
  };

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el || !hovering.current) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width;
    const y  = (e.clientY - r.top)  / r.height;
    const rx = (y - 0.5) * -16;
    const ry = (x - 0.5) *  16;
    el.style.transition = 'transform 0.07s ease-out';
    el.style.transform  = `perspective(900px) rotateZ(0deg) translateY(0px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`;
    const glare = el.querySelector<HTMLDivElement>('.pg');
    if (glare) {
      glare.style.opacity    = '1';
      glare.style.background = `radial-gradient(circle at ${Math.round(x * 100)}% ${Math.round(y * 100)}%, rgba(255,255,255,0.28) 0%, transparent 55%)`;
    }
  };

  const onLeave = () => {
    hovering.current = false;
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s';
    el.style.transform  = base;
    el.style.boxShadow  = '0 5px 28px rgba(0,0,0,0.52)';
    el.style.zIndex     = '1';
    const glare = el.querySelector<HTMLDivElement>('.pg');
    if (glare) { glare.style.opacity = '0'; glare.style.transition = 'opacity 0.3s'; }
  };

  return (
    <Link
      ref={cardRef}
      href={`/collections/${col.id}`}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: 'block',
        background: '#fff',
        padding: '11px 11px 46px',
        transform: base,
        boxShadow: '0 5px 28px rgba(0,0,0,0.52)',
        transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s',
        cursor: 'pointer',
        willChange: 'transform',
        zIndex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glare */}
      <div
        className="pg"
        style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 10, transition: 'opacity 0.3s' }}
      />

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
}

export default function CollectionGrid({ collections }: Props) {
  if (!collections.length) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
        <p className="font-light">No collections published yet.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
      gap: '56px 40px',
      padding: '28px 4px 52px',
      alignItems: 'start',
    }}>
      {collections.map((col, i) => (
        <CollectionCard
          key={col.id}
          col={col}
          rotation={ROTATIONS[i % ROTATIONS.length]}
          ty={TRANSLATES[i % TRANSLATES.length]}
        />
      ))}
    </div>
  );
}
