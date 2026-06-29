'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props { collections: Collection[] }

const ROTATIONS  = [-4,  3, -2,  5, -3,  4, -5,  2];
const TRANSLATES = [ 0, 18,  6, -10, 14, -6,  4, -14];

/* Generates a smooth closed blob path in objectBoundingBox space (0–1).
   vx/vy: smoothed cursor velocity in 0-1 space. Stretches the blob along the
   movement direction and boosts wobble amplitude proportional to speed. */
function buildBlobPath(
  cx: number, cy: number, radius: number, t: number,
  vx: number, vy: number,
): string {
  const N = 9;
  const pts: { x: number; y: number }[] = [];

  const speed = Math.sqrt(vx * vx + vy * vy);
  /* Wobble amplitude scales up with speed — fast cursor = more chaotic edges */
  const amp = 1 + Math.min(speed * 5, 2.2);
  /* Directional stretch: elongate along velocity, compress perpendicular */
  const stretch = 1 + Math.min(speed * 2.2, 0.52);
  const squash  = 1 - Math.min(speed * 0.9, 0.22);
  const vLen = speed || 1;
  const nx = vx / vLen;  // unit vector along movement
  const ny = vy / vLen;
  const px = -ny;        // unit vector perpendicular
  const py =  nx;

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (
      1
      + Math.sin(angle * 2 + t * 1.30) * 0.24 * amp
      + Math.sin(angle * 3 - t * 0.80) * 0.16 * amp
      + Math.sin(angle * 5 + t * 2.10) * 0.09 * amp
      + Math.sin(angle * 7 - t * 0.55) * 0.04 * amp
      + Math.sin(t * 0.45)              * 0.06       // global breathing (unaffected by speed)
    );
    /* Base point in local space */
    const bx = Math.cos(angle) * r;
    const by = Math.sin(angle) * r;
    /* Project onto movement / perpendicular axes and apply stretch/squash */
    const along = bx * nx + by * ny;
    const perp  = bx * px + by * py;
    pts.push({
      x: cx + along * nx * stretch + perp * px * squash,
      y: cy + along * ny * stretch + perp * py * squash,
    });
  }

  /* Catmull-Rom → cubic bezier, closed loop */
  const n = pts.length;
  const d: string[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    if (i === 0) d.push(`M${p1.x.toFixed(4)} ${p1.y.toFixed(4)}`);
    d.push(`C${cp1x.toFixed(4)} ${cp1y.toFixed(4)} ${cp2x.toFixed(4)} ${cp2y.toFixed(4)} ${p2.x.toFixed(4)} ${p2.y.toFixed(4)}`);
  }
  d.push('Z');
  return d.join(' ');
}

function CollectionCard({
  col,
  rotation,
  ty,
  index,
}: {
  col: Collection;
  rotation: number;
  ty: number;
  index: number;
}) {
  const cardRef     = useRef<HTMLAnchorElement>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const blobPathRef = useRef<SVGPathElement>(null);
  const hovering    = useRef(false);

  /* Blob animation state — all in refs to avoid re-renders */
  const targetPos      = useRef({ x: 0.5, y: 0.5 });
  const currentPos     = useRef({ x: 0.5, y: 0.5 });
  const targetRadius   = useRef(0);
  const currentRadius  = useRef(0);
  const timeRef        = useRef(Math.random() * 100); // stagger phase per card
  const prevTimestamp  = useRef(0);
  /* Velocity tracking — raw impulse set on each mousemove, decays each frame */
  const rawVelocity    = useRef({ x: 0, y: 0 });
  const smoothVelocity = useRef({ x: 0, y: 0 });
  const prevMousePos   = useRef({ x: 0.5, y: 0.5 });

  const cover      = col.cover_photo?.cloudinary_public_id;
  const hoverCover = col.hover_photo?.cloudinary_public_id;
  const clipId     = `bvk-blob-${col.id}`;
  const base       = `perspective(900px) rotateZ(${rotation}deg) translateY(${ty}px) scale(1)`;

  /* Scroll reveal stagger */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wrapper.style.transitionDelay = `${index * 75}ms`;
          wrapper.classList.add('sr-visible');
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(wrapper);
    return () => obs.disconnect();
  }, [index]);

  /* RAF blob animation — only runs if there's a hover photo */
  useEffect(() => {
    if (!hoverCover) return;
    const blobPath = blobPathRef.current;
    if (!blobPath) return;

    let rafId: number;
    const animate = (ts: number) => {
      const dt = prevTimestamp.current ? Math.min((ts - prevTimestamp.current) / 1000, 0.05) : 0.016;
      prevTimestamp.current = ts;
      timeRef.current += dt;

      /* Smooth position/radius lerp */
      currentPos.current.x    += (targetPos.current.x    - currentPos.current.x)    * Math.min(1, dt * 9);
      currentPos.current.y    += (targetPos.current.y    - currentPos.current.y)    * Math.min(1, dt * 9);
      currentRadius.current   += (targetRadius.current   - currentRadius.current)   * Math.min(1, dt * 4.5);

      /* Decay raw velocity each frame, then smooth toward it */
      const decay = Math.pow(0.12, dt); // fast decay — velocity is purely from mouse events
      rawVelocity.current.x   *= decay;
      rawVelocity.current.y   *= decay;
      smoothVelocity.current.x += (rawVelocity.current.x - smoothVelocity.current.x) * Math.min(1, dt * 14);
      smoothVelocity.current.y += (rawVelocity.current.y - smoothVelocity.current.y) * Math.min(1, dt * 14);

      if (currentRadius.current > 0.004) {
        blobPath.setAttribute('d', buildBlobPath(
          currentPos.current.x,
          currentPos.current.y,
          currentRadius.current,
          timeRef.current,
          smoothVelocity.current.x,
          smoothVelocity.current.y,
        ));
      } else {
        blobPath.setAttribute('d', 'M0 0Z');
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [hoverCover]);

  const getPos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const r = el.getBoundingClientRect();
    /* Offset the y to be relative to just the photo area (top 11px padding eats into coords) */
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top)  / r.height * 1.25, // compensate polaroid bottom padding
    };
  };

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    hovering.current = true;
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s';
    el.style.transform  = 'perspective(900px) rotateZ(0deg) translateY(0px) rotateX(0deg) rotateY(0deg) scale(1.05)';
    el.style.boxShadow  = '0 28px 80px rgba(0,0,0,0.72)';
    el.style.zIndex     = '2';
    if (hoverCover) {
      const p = getPos(e);
      targetPos.current        = p;
      prevMousePos.current     = p;
      rawVelocity.current      = { x: 0, y: 0 };
      smoothVelocity.current   = { x: 0, y: 0 };
      targetRadius.current     = 0.44;
    }
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
    if (hoverCover) {
      const nx = x;
      const ny = y * 1.25;
      rawVelocity.current = {
        x: nx - prevMousePos.current.x,
        y: ny - prevMousePos.current.y,
      };
      prevMousePos.current = { x: nx, y: ny };
      targetPos.current    = { x: nx, y: ny };
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
    if (hoverCover) targetRadius.current = 0;
  };

  return (
    <div ref={wrapperRef} className="sr-hidden">
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
        <div className="pg" style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 10, transition: 'opacity 0.3s' }} />

        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
          {/* Morphing blob clip path — updated every frame by the RAF loop */}
          {hoverCover && (
            <svg
              aria-hidden="true"
              style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
            >
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path ref={blobPathRef} d="M0 0Z" />
                </clipPath>
              </defs>
            </svg>
          )}

          {cover ? (
            <>
              <Image
                src={thumbUrl(cover)}
                alt={col.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                style={{ objectPosition: col.cover_photo_position ?? '50% 50%' }}
              />
              {/* Hover photo revealed through the morphing blob clip path — photo itself is undistorted */}
              {hoverCover && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    clipPath: `url(#${clipId})`,
                  }}
                >
                  <Image
                    src={thumbUrl(hoverCover)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    style={{ objectPosition: col.hover_photo_position ?? '50% 50%' }}
                  />
                </div>
              )}
            </>
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
    </div>
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
          index={i}
        />
      ))}
    </div>
  );
}
