'use client';

import { useEffect, useState } from 'react';
import { Camera, Aperture, Image as ImageIcon, Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Base dimensions at desktop size
const BASE_S    = 114;   // front face size (px)
const BASE_D    = 20;    // glass thickness (px)
const BASE_R    = 26;    // corner radius (px)
const BASE_ICON = 40;    // lucide icon size (px)
const MOBILE_SCALE = 0.70;

interface TileCfg {
  Icon: LucideIcon;
  tilt: string;
  top: string; right: string;
  mTop: string; mRight: string;
  dur: string; delay: string;
}

const TILES: TileCfg[] = [
  {
    Icon:  Camera,
    tilt:  'rotateX(12deg) rotateY(-22deg) rotateZ(-5deg)',
    top: '11%', right: '13%',
    mTop: '8%',  mRight: '6%',
    dur: '5.2s', delay: '0s',
  },
  {
    Icon:  Aperture,
    tilt:  'rotateX(8deg) rotateY(19deg) rotateZ(4deg)',
    top: '37%', right: '3%',
    mTop: '42%', mRight: '2%',
    dur: '6.1s', delay: '0.75s',
  },
  {
    Icon:  ImageIcon,
    tilt:  'rotateX(-9deg) rotateY(-18deg) rotateZ(3deg)',
    top: '26%', right: '37%',
    mTop: '24%', mRight: '28%',
    dur: '4.9s', delay: '1.35s',
  },
  {
    Icon:  Film,
    tilt:  'rotateX(13deg) rotateY(21deg) rotateZ(-4deg)',
    top: '57%', right: '19%',
    mTop: '50%', mRight: '14%',
    dur: '5.7s', delay: '1.95s',
  },
];

const edgeBase = {
  backdropFilter:       'blur(18px) saturate(1.6) brightness(1.15)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.6) brightness(1.15)',
  backfaceVisibility:   'hidden' as const,
};

export default function GlassTiles() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(window.innerWidth < 768 ? MOBILE_SCALE : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const S    = BASE_S    * scale;
  const D    = BASE_D    * scale;
  const R    = BASE_R    * scale;
  const icon = Math.round(BASE_ICON * scale);

  return (
    <>
      <style>{`
        @keyframes gtFloat {
          0%,100% { transform: var(--gt-tilt) translateY(0px);   }
          45%      { transform: var(--gt-tilt) translateY(-18px); }
          72%      { transform: var(--gt-tilt) translateY(-7px);  }
        }
        @keyframes gtShadow {
          0%,100% { transform: scaleX(1.00); opacity: 0.38; }
          45%      { transform: scaleX(0.66); opacity: 0.16; }
          72%      { transform: scaleX(0.84); opacity: 0.26; }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '54%',
        zIndex: 4,
        pointerEvents: 'none',
      }}>
        {TILES.map(({ Icon, tilt, top, right, mTop, mRight, dur, delay }, i) => (
          <div key={i} style={{
            position: 'absolute',
            top:   scale < 1 ? mTop   : top,
            right: scale < 1 ? mRight : right,
            width: S, height: S,
          }}>

            {/* Floating shadow */}
            <div style={{
              position: 'absolute',
              top: S + 14, left: '9%',
              width: '82%', height: 16,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.50)',
              filter: 'blur(12px)',
              animation: `gtShadow ${dur} ease-in-out ${delay} infinite`,
            }} />

            {/* 3-D box */}
            <div style={{
              position: 'absolute', inset: 0,
              transformStyle: 'preserve-3d',
              ['--gt-tilt' as string]: tilt,
              animation: `gtFloat ${dur} ease-in-out ${delay} infinite`,
            }}>

              {/* FRONT FACE — pure frosted glass, no colour tint.
                  Aurora colour bleeds through via backdropFilter naturally. */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: R,
                background: `
                  linear-gradient(145deg,
                    rgba(255,255,255,0.28) 0%,
                    rgba(255,255,255,0.10) 40%,
                    rgba(255,255,255,0.04) 100%)
                `,
                backdropFilter:       'blur(28px) saturate(1.8) brightness(1.10)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.8) brightness(1.10)',
                border: '1px solid rgba(255,255,255,0.50)',
                boxShadow: `
                  0 2px 0 rgba(255,255,255,0.40) inset,
                  0 -1px 0 rgba(255,255,255,0.08) inset,
                  1px 0 0 rgba(255,255,255,0.22) inset
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Icon — strong extrusion effect via layered drop-shadows.
                    Bright highlight above-left + deep shadow below-right
                    makes the strokes look physically raised from the surface. */}
                <div style={{
                  color: 'rgba(255,255,255,1)',
                  filter: [
                    'drop-shadow(0 -2px   0   rgba(255,255,255,0.90))',  // top edge highlight
                    'drop-shadow(-2px 0   0   rgba(255,255,255,0.50))',  // left edge highlight
                    'drop-shadow(0    3px 0   rgba(0,0,0,0.85))',        // bottom cast shadow
                    'drop-shadow(2px  0   0   rgba(0,0,0,0.55))',        // right cast shadow
                    'drop-shadow(0    5px 8px rgba(0,0,0,0.55))',        // depth blur
                  ].join(' '),
                }}>
                  <Icon size={icon} strokeWidth={1.6} />
                </div>

                {/* Top-left gloss streak — mimics light hitting a glass surface */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '42%',
                  borderRadius: `${R}px ${R}px 50% 50% / ${R}px ${R}px 22% 22%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* RIGHT FACE */}
              <div style={{
                position: 'absolute',
                top: R, left: S, width: D, height: S - 2 * R,
                transformOrigin: '0% 50%',
                transform: 'rotateY(90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.52) 0%,
                  rgba(255,255,255,0.24) 40%,
                  rgba(255,255,255,0.10) 75%,
                  rgba(255,255,255,0.04) 100%
                )`,
                borderRight: '1px solid rgba(255,255,255,0.22)',
                ...edgeBase,
              }} />

              {/* LEFT FACE */}
              <div style={{
                position: 'absolute',
                top: R, left: -D, width: D, height: S - 2 * R,
                transformOrigin: '100% 50%',
                transform: 'rotateY(-90deg)',
                background: `linear-gradient(to bottom,
                  rgba(255,255,255,0.42) 0%,
                  rgba(255,255,255,0.18) 45%,
                  rgba(255,255,255,0.06) 100%
                )`,
                borderLeft: '1px solid rgba(255,255,255,0.18)',
                ...edgeBase,
              }} />

              {/* TOP FACE */}
              <div style={{
                position: 'absolute',
                top: -D, left: R, width: S - 2 * R, height: D,
                transformOrigin: '50% 100%',
                transform: 'rotateX(90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.42) 0%,
                  rgba(255,255,255,0.30) 50%,
                  rgba(255,255,255,0.18) 100%
                )`,
                borderTop: '1px solid rgba(255,255,255,0.32)',
                ...edgeBase,
              }} />

              {/* BOTTOM FACE */}
              <div style={{
                position: 'absolute',
                top: S, left: R, width: S - 2 * R, height: D,
                transformOrigin: '50% 0%',
                transform: 'rotateX(-90deg)',
                background: `linear-gradient(to right,
                  rgba(255,255,255,0.12) 0%,
                  rgba(255,255,255,0.26) 50%,
                  rgba(255,255,255,0.12) 100%
                )`,
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                ...edgeBase,
              }} />

            </div>
          </div>
        ))}
      </div>
    </>
  );
}
